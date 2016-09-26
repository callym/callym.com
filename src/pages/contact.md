---
title: contact
---
<h1>links</h1>

[@callymcallym](http://twitter.com/callymcallym)

[github](http://github.com/callym)

[hi@callym.com](mailto:hi@callym.com)

# push notifications
get notifications sent straight to your browser!
<div class="center monospace">
<span id="push_notifications">
	<noscript>
		push notifications only work with javascript turned on
	</noscript>
</span>
<a href="" id="push_notifications_action" style="display: none;"></a>
</div>

# email
get email updates!
<form class="center">
	<div class="email">
		<label for="email">email</label>
		<span class="email-input">
			<input type="email" id="email" name="email_address"/>
		</span>
	</div>
	<div class="checkboxes">
		<div>
			<input type="checkbox" id="email_updates"/>
			<label for="email_updates">updates
			<div class="form-description">
				get an email when I post new work on my site
			</div>
			</label>
		</div>

		<div>
			<input type="checkbox" id="email_news"/>
			<label for="email_news">news
			<div class="form-description">
				get emails about things I've found that are interesting
			</div>
			</label>
		</div>

		<div>
			<input type="checkbox" id="email_dogs"/>
			<label for="email_dogs">dogs
			<div class="form-description">
				get email summaries about cute dogs that I've found
			</div>
			</label>
		</div>
	</div>
	<div class="big-button">
		<button>subscribe!</button>
	</div>
</form>

<script>
$(document).ready(function() {
	var is_subscribed = false;
	var $action_link = $('#push_notifications_action');

	var update_message = function() {
		var message = "";
		var action = "";
		if (is_subscribed) {
			message = "you have already subscribed!";
			action = "click here to unsubscribe";
		}
		else {
			message = "you aren't currently subscribed!";
			action = "click here to subscribe";	
		}
		$('#push_notifications').html(message);
		$action_link.html(action);
	};

	var toggle_subscribe = function() {
		if (is_subscribed) {
			push_unsubscribe()
				.then(function() {
					is_subscribed = false;
					update_message();
				});
		}
		else {
			push_subscribe()
				.then(function() {
					is_subscribed = true;
					update_message();
				});
		}
		return false;
	};

	$action_link.on('click', toggle_subscribe);

	if (!navigator.serviceWorker || !('PushManager' in window))
	{
		$('#push_notifications').html(
			`<p>your web browser doesn't support Service Workers or Push Notifications</p>
			<p>for more information about what browsers do, check
			<a href="http://caniuse.com/#feat=push-api">here</a></p>`
		);
	}
	else if (Notification.permission === 'denied') {
		$('#push_notifications').html(
			`<p>you have blocked notifications!</p>
			<p>if you want to unblock them, see instructions
			<a href="https://support.google.com/chrome/answer/6148059?hl=en-GB&ref_topic=3434353">
				here (Google Chrome)</a>
			(steps for Firefox are very similar)</p>`
		);
	} else {
		$action_link.show();
		navigator.serviceWorker.ready
			.then(function(registration) {
				return registration.pushManager.getSubscription();
			})
			.then(function(subscription) {
				if (subscription) {
					is_subscribed = true;
				}
			})
			.then(update_message);
	}
});
</script>