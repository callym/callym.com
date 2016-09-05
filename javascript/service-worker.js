var version = "date::<%= now %>";

self.addEventListener("install", function(event) {
	console.log('WORKER: install event in progress.');
	console.log('WORKER: version: ' + version);
	event.waitUntil(
		caches
			.open(version + '::pages')
			.then(function(cache) {
				return cache.addAll([
					<% if (build) { %>
					'/css/main.css',
					<% } %>
					'/images/blueglitter.gif',
					'/offline/index.html'
				]);
			})
			.then(() => self.skipWaiting())
	);
});

self.addEventListener("fetch", function(event) {
	if (event.request.method !== 'GET') {
		return;
	}

	event.respondWith(
		caches
			.match(event.request)
			.then(function(cached) {
				var networked = fetch(event.request)
					.catch(unableToResolve);

				return cached || networked;

				function unableToResolve () {
					return caches.match("/offline/index.html");
				}
			})
	);
});

self.addEventListener("activate", function(event) {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(
				keys
					.filter((key) => !key.startsWith(version))
					.map((key) => caches.delete(key))
			))
			.then(() => self.clients.claim())
	);
});