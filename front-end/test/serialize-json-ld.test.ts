import assert from "node:assert/strict";
import test from "node:test";
import { serializeJsonLd } from "../src/utils/serializeJsonLd";

test("JSON-LD serializer neutralizes script-closing and line-separator characters", () => {
	const serialized = serializeJsonLd({
		text: "</script><script>alert(1)</script>\u2028\u2029"
	});

	assert.equal(serialized.includes("<"), false);
	assert.equal(serialized.includes("\u2028"), false);
	assert.equal(serialized.includes("\u2029"), false);
	assert.ok(serialized.includes("\\u003c/script>"));
});
