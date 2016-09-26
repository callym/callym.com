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
<form class="center" id="email-subscription-form">
	<div class="email">
		<label for="email">email</label>
		<span class="email-input">
			<input type="email" id="email" name="email_address" required/>
		</span>
	</div>
	<div class="checkboxes" id="topics">
		<div>
			<input type="checkbox" id="email_updates" data-topic="updates" checked/>
			<label for="email_updates">updates
			<div class="form-description">
				get an email when I post new work on my site
			</div>
			</label>
		</div>

		<div>
			<input type="checkbox" id="email_news" data-topic="news" checked/>
			<label for="email_news">news
			<div class="form-description">
				get emails about things I've found that are interesting
			</div>
			</label>
		</div>

		<div>
			<input type="checkbox" id="email_dogs" data-topic="dogs" checked/>
			<label for="email_dogs">dogs
			<div class="form-description">
				get email summaries about cute dogs that I've found
			</div>
			</label>
		</div>
	</div>
	<div class="big-button">
		<button type="button" id="email-subscription-button">
			subscribe!
		</button>
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

	$('#email-subscription-button').on('click', function() {
		var $form = $('#email-subscription-form');

		var email = $form.find('#email').val();

		if (email.length === 0) {
			callym.message("you need to enter an email", 'error');
			return;
		}

		if (email.indexOf('@') == -1) {
			callym.message("your email address needs to contain an '@'", 'error');
			return;
		}

		if (email.split('@').filter(Boolean).length < 2) {
			callym.message("your email needs text before and after the '@'", 'error');
			return;
		}

		// unsubscribe!
		if ($(this).hasClass('error')) {
			var subscription = {
				email: email
			};

			fetch('https://z8jnhu3g0g.execute-api.eu-west-1.amazonaws.com/production/unregister', {
				method: 'post',
				headers: {
					'Content-type' : 'application/json'
				},
				body: JSON.stringify(subscription)
			});
		}

		var topics = [];
		$form.find('input[type=checkbox]').each(function() {
			var $this = $(this);
			if ($this.prop('checked')) {
				topics.push($this.data('topic'));
			}
		});
		
		var subscription = {
			email: email,
			topics: topics
		};
		fetch('https://z8jnhu3g0g.execute-api.eu-west-1.amazonaws.com/production/register', {
			method: 'post',
			headers: {
				'Content-type' : 'application/json'
			},
			body: JSON.stringify(subscription)
		}).then(function() {
			callym.message("you have been sent a confirmation email");
		});
	});
	
	$('#email-subscription-form #topics input[type=checkbox]').on('click', function() {
		var checked = 0;
		$('#email-subscription-form input[type=checkbox]').each(function() {
			checked += $(this).prop('checked') ? 1 : 0;
		});
		if (checked <= 0) {
			callym.message("please select at least one category to subscribe", 'error');
			$('#email-subscription-button').addClass('error').text('unsubscribe!');
		} else {
			$('#email-subscription-button').removeClass('error').text('subscribe!');
		}
	});

	var urlParams = new URLSearchParams(window.location.search);
	$('#email-subscription-form #email').val(urlParams.get('email'));

	var topics = urlParams.get('topics') || [];

	$('#email-subscription-form input[type=checkbox]').each(function() {
		var $this = $(this);
		if (topics.indexOf($this.data('topic')) > -1) {
			$this.prop('checked', true);
		} else {
			$this.prop('checked', false);
		}
	});
	$('#email-subscription-form #topics').trigger('click');
});
</script>