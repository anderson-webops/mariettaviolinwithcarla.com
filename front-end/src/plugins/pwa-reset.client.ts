export default defineNuxtPlugin(() => {
	if (!import.meta.env.DEV) return;

	const { public: publicConfig } = useRuntimeConfig();
	if (publicConfig.pwaDevSw) return;

	// Clear any stale service workers/caches when dev SW is disabled.
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker
			.getRegistrations()
			.then((registrations) => {
				registrations.forEach((registration) => {
					registration.unregister();
				});
			})
			.catch(() => {});
	}

	if ("caches" in window) {
		caches
			.keys()
			.then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
			.catch(() => {});
	}
});
