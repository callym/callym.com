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
					'/offline/index.html',
					'/notification-icon-512x512.png',
					'/notification-badge-128x128.png'
				]);
			})
			.then(() => self.skipWaiting())
			.catch(function(error) {
				console.log('WORKER: ', error);
			})
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
	var payload = event.data ? event.data.json() : {};

	payload.title = payload.title || "callym.com";
	payload.body = payload.body || "hi!";
	payload.icon = payload.icon || "/notification-icon-512x512.png";
	payload.badge = payload.badge || "/notification-badge-128x128.png";
	payload.tag = payload.tag || "default";
	
	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: payload.icon,
			badge: payload.badge,
			tag: payload.tag
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