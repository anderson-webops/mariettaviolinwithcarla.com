function xmlEscape(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export default defineEventHandler((event) => {
	const origin = getRequestURL(event).origin;
	const loc = xmlEscape(new URL("/", `${origin}/`).toString());

	setHeader(event, "content-type", "application/xml; charset=utf-8");

	return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${loc}</loc></url></urlset>`;
});
