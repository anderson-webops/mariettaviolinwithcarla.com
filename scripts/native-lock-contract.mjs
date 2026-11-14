import assert from "node:assert/strict";

const providers = [
	["@esbuild/linux-", "esbuild", 2],
	["@oxfmt/binding-linux-", "oxfmt", 4],
	["@oxc-parser/binding-linux-", "oxc-parser", 4],
	["@rolldown/binding-linux-", "rolldown", 4],
	["@rollup/rollup-linux-", "rollup", 4],
	["@unrs/resolver-binding-linux-", "unrs-resolver", 4],
	["lightningcss-linux-", "lightningcss", 4]
];

export function assertNativeProviderBindings(frontend, lock) {
	const declarations = Object.entries(frontend.optionalDependencies || {});
	const packages = lock.packages || {};
	const checked = new Set();
	for (const [prefix, providerName, count] of providers) {
		const providerPath = `node_modules/${providerName}`;
		const provider = packages[providerPath];
		assert.ok(provider?.version, `Missing selected native provider: ${providerName}`);
		const bindings = declarations.filter(([name]) => name.startsWith(prefix));
		assert.equal(bindings.length, count, `Incomplete Linux target declarations for ${providerName}`);
		for (const [name, version] of bindings) {
			assert.equal(version, provider.version, `${name} must match ${providerName}`);
			assert.equal(provider.optionalDependencies?.[name], version, `${name} is not declared by ${providerName}`);
			const resolved = packages[`${providerPath}/node_modules/${name}`] || packages[`node_modules/${name}`];
			assert.equal(resolved?.version, version, `${name} must resolve from ${providerName}`);
			checked.add(name);
		}
	}
	const unknown = declarations.filter(([name]) => name.includes("linux-") && !checked.has(name));
	assert.deepEqual(unknown, [], "Review the selected provider for every declared Linux binding");
	return checked.size;
}
