---
title: push notifications without a server
categories: web programming
date: 2016-09-25
github_issue: 9
---
In my 
[previous post](/blog/rebuilding-callym-com/#new-technology),
I mention Push Notifications as a new technology on the web. 

They are exciting because they let you notify users whenever you want,
and they can be sent to Android phones, where they appear just like 
a native notification. 
(They are also supported on desktop browsers, but that's less exciting.)

When looking on how to add them to my site, there were loads of guides
on how to add the client-side part, which is implemented in a service worker,
and nothing on the server-side, apart from clues such as:

`The endpoint should be saved on your server for each user,
since you’ll need them to send push messages at a later date.`

Which isn't very useful, as I...
* don't have a server, due to this site being completely static
* know nothing about server programming

Looking around, I stumbled upon the idea of *serverless* APIs,
where you have an API, and when it's triggered, it starts a program 
that does a ~server~ thing.

But how do I trigger a program when I **still** don't have a server 
behind my site at all?

I found a few resources for making static sites less static, 
but they all pointed to things like embeddable contact forms 
that use a 3rd party service for the dynamic content...

Until I found
[this article](https://medium.com/@john.titus/moving-a-simple-api-to-amazon-s-api-gateway-680d025e0921),
which introduced me to AWS Lambda!
AWS Lambda? What does that mean?
Amazon Web Services (AWS) is a vast collection of cloud-based products, 
which are incredibly cheap as you only pay for what you use.
I already use AWS S3 to store my website,
and Cloudfront which acts as a CDN in front of it.
The page for Lambda on the AWS site describes it as:

`AWS Lambda is a compute service where you can upload your code to AWS Lambda and the
service can run the code on your behalf using AWS infrastructure. 
After you upload your code and create what we call a Lambda function, 
AWS Lambda takes care of provisioning and managing the servers that you use to run 
the code. You can use AWS Lambda as follows:`
* `As an event-driven compute service where AWS Lambda runs your code in response
to events, such as changes to data in an Amazon S3 bucket or an Amazon DynamoDB table.`
* `As a compute service to run your code in response to HTTP requests using 
Amazon API Gateway or API calls made using AWS SDKs.`

The second bullet point seems to be exactly what we want, 
run code based on a HTTP request!

The Medium article above shows how to set up an API that runs code 
and returns a result to the browser, using node.js (server-side javascript).
I used this, along with the [web-push](https://github.com/web-push-libs/web-push)
library documentation, to come up with

```javascript
function push_subscribe() {
	return navigator.serviceWorker.ready
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

			var data = {
				endpoint: endpoint,
				topics: topics,
				key: key,
				auth_secret: auth_secret
			};

			fetch('AMAZON-API-GATEWAY/SERVICE/URL', {
				method: 'post',
				headers: {
					'Content-type' : 'application/json'
				},
				body: JSON.stringify(data)
			});
		});
};
```

This function first returns the push subscription, and then from that 
extracts the p256dh and auth keys, converts them to the right format 
(thanks to [this article](https://serviceworke.rs/push-payload_index_doc.html)),
and then sends a JSON object that is the 
endpoint the notification needs to be sent to,
the topics that they're subscribing to
(currently just `main`, but allows me to add new categories later if I want),
and then the keys.

The Lambda function just puts this all into an AWS database,
which is super simple.

```javascript 
var aws = require('aws-sdk');

var doc_client = new aws.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
	/*
	event = {
		"endpoint": "http://url-of-gcm-here.com",
		"topics": ["topics", "here"],
		"key": "key",
		"auth_secret": "auth_secret"
	}
	*/
	var params = {
		TableName: 'TABLE NAME',
		Item: {
			endpoint: event.endpoint,
			topics: event.topics,
			key: event.key,
			auth_secret: event.auth_secret
		}
	};

	doc_client.put(params, function(error, data) {
		if (error) {
			console.log("ERROR:" + error);
			context.fail(error);
		}
		else {
			console.log("SUCCESS: " + JSON.stringify(data));
			context.succeed(data);
		}
	});
};
```

There's a similar function that sends the endpoint to another Lambda function 
to unsubscribe (removes its entry from the database).

To send notifications, I first started with a Lambda function, before realising
that I actually didn't need this to be on the server at all!
All I needed to do was to iterate over the AWS database, which I could 
access through the `aws-sdk` node package, 
then send an object to each endpoint!

If an endpoint returns an error message, it removes the entry from the database,
so I don't waste time sending notifications to clients that don't exist.

The object sent is really simple, any of the fields can be left blank

```json
{
	payload: {
		topics: ['topic', 'array', 'here'],
		title: 'title string',
		body: 'body string',
		url: 'onclick url',
		icon: 'notification icon',
		badge: 'icon for notification bar',
		tag: 'tag for collapsing notifications'
	},
	userPublicKey: item.key,
	userAuth: item.auth_secret 
}
```

And then in the service-worker:

```javascript
self.addEventListener('push', function(event) {
	var payload = event.data ? event.data.json() : {};

	payload.title = payload.title || "callym.com";
	payload.body = payload.body || "hi!";
	payload.icon = payload.icon || "/notification-icon-512x512.png";
	payload.badge = payload.badge || "/notification-badge-128x128.png";
	payload.tag = payload.tag || "default";
	payload.url = payload.url || "/";
	
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
```

I found a lot of this confusing at first, going from 
"wow I really want push notifications", to 
"ugh it looks like it's not possible without a server", to
messing around for hours in AWS Lambda, trying to get everything working right,
but now I think I have a system that works well for what I need.

The hardest part was understanding how it all tied together,
from the client-side code
(which is [luckily](https://developers.google.com/web/fundamentals/getting-started/push-notifications/)
[well-documented](https://serviceworke.rs/push-simple.html)),
to AWS API Gateway, Lambda, DynamoDB, and node.js.

The code looks very simple now it's laid out on this page,
and that's because it is quite simple, 
but I found the idea of using Lambda to bridge the gap between 
static and dynamic sites incredibly exciting, as it'll 
allow me to add a lot of things that I thought was impossible at first.