import { getMongoReadiness } from "./_shared/mongo-readiness.mjs";

const headers = {
	"Cache-Control": "no-store",
	"Content-Type": "application/json"
};

export async function handler() {
	const { statusCode, payload } = await getMongoReadiness();

	return {
		statusCode,
		headers,
		body: JSON.stringify(payload)
	};
}
