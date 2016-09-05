if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js');
}

window.addEventListener('online', () => onOnline());

window.addEventListener('offline', () => onOffline());

// Check if the user is connected.
if (navigator.onLine) {
	onOnline();
} else {
	onOffline();
}

function onOnline() {
	document.getElementById("offline").style.opacity = "0";
}

function onOffline() {
	document.getElementById("offline").style.opacity = "1";
}