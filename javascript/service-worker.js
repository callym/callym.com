var version = "v0.002::";

self.addEventListener("install", function(event) {
	console.log('WORKER: install event in progress.');
	event.waitUntil(
		caches
			.open(version + 'pages')
			.then(function(cache) {
				return cache.addAll([
//					'/',
					'/css/main.css',
					'/images/blueglitter.gif',
//					'/javascript/main.js'
					'/offline/index.html'
				]);
			})
			.then(function() {
				console.log('WORKER: install completed');
			})
	);
});

self.addEventListener("fetch", function(event) {
	console.log('WORKER: fetch event in progress.');

	if (event.request.method !== 'GET') {
		// ignore requests that aren't GET
		console.log('WORKER: fetch event ignored.',
			event.request.method,
			event.request.url);
		return;
	}

	event.respondWith(
		caches
			.match(event.request)
			.then(function(cached) {
				// if in cache, give that THEN go to network to refresh cache
				// "eventually fresh" pattern
				// https://ponyfoo.com/articles/progressive-networking-serviceworker
				var networked = fetch(event.request)
					// success, failure
					.then(fetchedFromNetwork, unableToResolve)
					// error
					.catch(unableToResolve);

				/* We return the cached response immediately if there is one, and fall
					 back to waiting on the network as usual.
				*/
				console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
				return cached || networked;

				function fetchedFromNetwork(response) {
					// copy response to store in cache
					var cacheCopy = response.clone();

					console.log('WORKER: fetch response from network.', event.request.url);

					caches
						.open(version + 'pages')
						.then(function add(cache) {
							cache.put(event.request, cacheCopy);
						})
						.then(function() {
							console.log('WORKER: fetch response stored in cache.', event.request.url);
						});

					return response;
				}

				/* When this method is called, it means we were unable to produce a response
					 from either the cache or the network. This is our opportunity to produce
					 a meaningful response even when all else fails. It's the last chance, so
					 you probably want to display a "Service Unavailable" view or a generic
					 error response.
				*/
				function unableToResolve () {
					/* There's a couple of things we can do here.
						 - Test the Accept header and then return one of the `offlineFundamentals`
							 e.g: `return caches.match('/some/cached/image.png')`
						 - You should also consider the origin. It's easier to decide what
							 "unavailable" means for requests against your origins than for requests
							 against a third party, such as an ad provider
						 - Generate a Response programmaticaly, as shown below, and return that
					*/

					console.log('WORKER: fetch request failed in both cache and network.');

					return caches.match("/offline/index.html");
				}
			})
	);
});

self.addEventListener("activate", function(event) {
	console.log('WORKER: activate event in progress.');

	event.waitUntil(
		caches
			.keys()
			.then(function (keys) {
				return Promise.all(
					keys
						.filter(function (key) {
							return !key.startsWith(version);
						})
						.map(function (key) {
							return caches.delete(key);
						})
				);
			})
			.then(function() {
				console.log('WORKER: activate completed.');
			})
	);
});