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

self.addEventListener('push', function(event) {
	var title = "push message";
	event.waitUntil(
		self.registration.showNotification(title, {
			body: "the message",
			icon: "images/icon.png",
			tag: "my-tag"
		}))
});

self.addEventListener('notificationclick', function(event) {
	event.notification.close();
	event.waitUntil(
		clients.matchAll({
			type: 'window'
		})
		.then(function(windowClients) {
			for (var i = 0; i < windowClients.length; i++) {
				var client = windowClients[i];
				if (client.url === url && 'focus' in client) {
					return client.focus();
				}
			}
			if (clients.openWindow) {
				return clients.openWindow("https://youtu.be/gYMkEMCHtJ4");
			}
		})
	)
});