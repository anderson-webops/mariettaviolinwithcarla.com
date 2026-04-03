import process from "node:process";
import mongoose from "mongoose";

const { env } = process;

const VAULT_ADDR = env.VAULT_ADDR || "http://127.0.0.1:8200";
let mongoUriPromise;
let connectionPromise;

async function vaultLogin() {
	const response = await fetch(`${VAULT_ADDR}/v1/auth/approle/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			role_id: env.VAULT_ROLE_ID,
			secret_id: env.VAULT_SECRET_ID
		})
	});

	if (!response.ok) {
		throw new Error(`Vault login failed: ${response.status} ${await response.text()}`);
	}

	const data = await response.json();
	return data.auth.client_token;
}

async function readMongoSecret() {
	const token = await vaultLogin();
	const response = await fetch(`${VAULT_ADDR}/v1/secret/data/jacob/mongodb`, {
		headers: { "X-Vault-Token": token }
	});

	if (!response.ok) {
		throw new Error(`Vault read failed: ${response.status} ${await response.text()}`);
	}

	const data = await response.json();
	return data.data.data;
}

async function resolveMongoUri() {
	if (!mongoUriPromise) {
		mongoUriPromise = (async () => {
			try {
				const secret = await readMongoSecret();
				if (secret?.uri) return secret.uri;
			}
			catch {
				// Fall back to direct env configuration when Vault is unavailable.
			}

			if (env.MONGODB_URI) return env.MONGODB_URI;
			throw new Error("No MongoDB URI available");
		})().catch((error) => {
			mongoUriPromise = undefined;
			throw error;
		});
	}

	return mongoUriPromise;
}

async function ensureMongoConnection() {
	const connection = mongoose.connection;
	if (connection.readyState === 1 && connection.db) return connection;

	if (!connectionPromise) {
		connectionPromise = (async () => {
			const mongoUri = await resolveMongoUri();
			await mongoose.connect(mongoUri, {
				serverSelectionTimeoutMS: 5000
			});
			return mongoose.connection;
		})().catch((error) => {
			connectionPromise = undefined;
			throw error;
		});
	}

	return connectionPromise;
}

export async function getMongoReadiness() {
	try {
		const connection = await ensureMongoConnection();
		const state = connection.readyState;

		if (state !== 1 || !connection.db) {
			return {
				statusCode: 503,
				payload: {
					ready: false,
					components: {
						db: { ok: false, state }
					}
				}
			};
		}

		await connection.db.admin().ping();

		return {
			statusCode: 200,
			payload: {
				ready: true,
				components: {
					db: { ok: true, state }
				}
			}
		};
	}
	catch (error) {
		return {
			statusCode: 503,
			payload: {
				ready: false,
				components: {
					db: {
						ok: false,
						state: mongoose.connection.readyState,
						error: error instanceof Error ? error.message : "db-ping-failed"
					}
				}
			}
		};
	}
}
