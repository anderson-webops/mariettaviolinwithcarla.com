const headers = {
	"Cache-Control": "no-store",
	"Content-Type": "application/json"
};

export async function handler() {
	return {
		statusCode: 200,
		headers,
		body: JSON.stringify({ ok: true })
	};
}
