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
	payload.url = payload.url || "/";

	console.log(payload);
	
	event.waitUntil(
		self.registration.showNotification(payload.title, {
			body: payload.body,
			icon: payload.icon,
			badge: payload.badge,
			tag: payload.tag,
			data: {
				url: payload.url
			}
		}))
});

self.addEventListener('notificationclick', function(event) {
	event.notification.close();
	event.waitUntil(
		clients.matchAll({
			includeUncontrolled: true,
			type: 'window'
		})
		.then(function(activeClients) {
			if (activeClients.length > 0) {
				activeClients[0].navigate(event.notification.data.url);
				activeClients[0].focus()
			}
			else {
				clients.openWindow(event.notification.data.url);
			}
		})
	)
});