//=require lib/_zepto.js
//=require lib/_magnific-popup.js
//=require lib/_list.js

var endpoint;
var key;
var auth_secret;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js')
		.then(function(registration) {
			return registration.pushManager.getSubscription()
				.then(function(subscription) {
					if (subscription) {
						return subscription;
					}

					return registration.pushManager.subscribe({
						userVisibleOnly: true
					});
				})
		})
		.then(function(subscription) {
			var raw_key = subscription.getKey ? subscription.getKey('p256dh') : '';
			key = raw_key ?
					btoa(String.fromCharCode.apply(
						null,
						new Uint8Array(raw_key)
					))
					: '';
			var raw_auth_secret = subscription.getKey ? subscription.getKey('auth') : '';
			auth_secret = raw_auth_secret ?
							btoa(String.fromCharCode.apply(
								null,
								new Uint8Array(raw_auth_secret)
							))
							: '';
			endpoint = subscription.endpoint;
			var topics = ['main'];
			<% if (!build) { %>
				topics.push('dev');
			<% } %>

			var data = {
				endpoint: endpoint,
				topics: topics,
				key: key,
				auth_secret: auth_secret
			};
			console.log(JSON.stringify(data));

			fetch('https://uccr0qq45g.execute-api.eu-west-1.amazonaws.com/production/register', {
				method: 'post',
				headers: {
					'Content-type' : 'application/json'
				},
				body: JSON.stringify(data)
			});
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