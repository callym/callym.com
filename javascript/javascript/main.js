// ServiceWorker is a progressive technology. Ignore unsupported browsers
if ('serviceWorker' in navigator) {
	console.log('CLIENT: service worker registration in progress.');
	navigator.serviceWorker.register('@@/service-worker.js@@').then(function() {
		console.log('CLIENT: service worker registration complete.');
	}, function() {
		console.log('CLIENT: service worker registration failure.');
	});
} else {
	console.log('CLIENT: service worker is not supported.');
}

window.addEventListener('online', function(e) {
	console.log("You are online");
	onOnline();
}, false);

window.addEventListener('offline', function(e) {
	console.log("You are offline");
	onOffline();
}, false);

// Check if the user is connected.
if (navigator.onLine) {
	console.log("online");
	onOnline();
} else {
	console.log("offline");
	onOffline();
}

function onOnline() {
	document.getElementById("offline").style.opacity = "0";
}

function onOffline() {
	document.getElementById("offline").style.opacity = "1";
}