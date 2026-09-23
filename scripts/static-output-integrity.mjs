import assert from "node:assert/strict";

export function assertGeneratedTrackerMatchesSource(reviewedTracker, generatedTracker) {
	assert.equal(
		generatedTracker.equals(reviewedTracker),
		true,
		"Generated analytics tracker must exactly match the reviewed vendored source."
	);
}
