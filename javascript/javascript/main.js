//=require lib/_zepto.js
//=require lib/_magnific-popup.js
//=require lib/_list.js

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js')
		.then(function(register) {
			console.log('registered! ', register);
			register.pushManager.subscribe({
				userVisibleOnly: true
			}).then(function(sub) {
				console.log('endpoint: ', sub.endpoint);
			});
		}).catch(function(error) {
			console.log('ERROR!', error);
		});
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
	$('#offline')
		.anim({
			opacity: 0
		},
		0.5,
		'ease-in-out',
		function() {
			document.getElementById("offline").style.visibility = '';
		});
};

function onOffline() {
	document.getElementById("offline").style.visibility = 'visible';
	$('#offline')
		.anim({
			opacity: 1
		},
		0.5,
		'ease-in-out');
};