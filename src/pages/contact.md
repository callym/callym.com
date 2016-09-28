---
title: contact
---
<h1>links</h1>
<div class="contact links center">
[@callymcallym](http://twitter.com/callymcallym)

[github.com/callym](http://github.com/callym)

[hi@callym.com](mailto:hi@callym.com)
</div>

# push notifications
get notifications sent straight to your browser!
<div>
<form class="center" id="push-subscription-form">
	<div class="checkboxes" id="topics">
		<div>
			<input type="checkbox" id="push_portfolio" data-topic="portfolio" checked/>
			<label for="push_portfolio">portfolio
			<div class="form-description">
				get a notification when I add new art to my site
			</div>
			</label>
		</div>
		<div>
			<input type="checkbox" id="push_blog" data-topic="blog" checked/>
			<label for="push_blog">blog
			<div class="form-description">
				get a notification when I write a new blog post
			</div>
			</label>
		</div>
	</div>
	<div class="big-button">
		<label for="push_notifications_action" id="push_notifications_label">
			<noscript>
				push notifications only work with javascript turned on
			</noscript>
		</label>
		<button type="button" id="push_notifications_action" style="display: none">
			subscribe!
		</button>
	</div>
</form>
</div>

# email
get email updates!
<form class="center" id="email-subscription-form">
	<div class="email">
		<label for="email">email</label>
		<span class="email-input">
			<input 	type="email"
					id="email"
					name="email_address" 
					placeholder="your@email.com"
					required/>
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
	var check_subscribe = function(type, cb_zero, cb_else) {
		var checked = 0;
		$(`#${type}-subscription-form input[type=checkbox]`).each(function() {
			checked += $(this).prop('checked') ? 1 : 0;
		});
		if (checked <= 0) {
			if (cb_zero) {
				cb_zero();
			}
		} else {
			if (cb_else) {
				cb_else();
			}
		}
	}

	var get_topics = function(type) {
		var topics = [];
		$(`#${type}-subscription-form input[type=checkbox]`).each(function() {
			var $this = $(this);
			if ($this.prop('checked')) {
				topics.push($this.data('topic'));
			}
		});
		return topics;
	}

	var set_topics = function(type, topics) {
		if (topics) {
			$(`#${type}-subscription-form input[type=checkbox]`).each(function() {
				var $this = $(this);
				if (topics.indexOf($this.data('topic')) > -1) {
					$this.prop('checked', true);
				} else {
					$this.prop('checked', false);
				}
			});
		}
	}

	var is_subscribed = false;
	var $push_notification_button = $('#push_notifications_action');

	var check_push_subscribe = function() {
		check_subscribe('push',
		function() {
			callym.message(
				"please select at least one category to subscribe",
				'error');
			$push_notification_button
				.addClass('error')
				.text('unsubscribe!');
		},
		function() {
			$push_notification_button
				.removeClass('error')
				.text("subscribe!");
		});
	}

	$('#push-subscription-form #topics input[type=checkbox]').on('click', check_push_subscribe);

	var toggle_subscribe = function() {
		// unsubscribe!
		if ($(this).hasClass('error')) {
			push_unsubscribe()
				.then(function() {
					is_subscribed = false;
					check_push_subscribe();
				});
		}
		else {
			push_subscribe(get_topics('push'))
				.then(function() {
					is_subscribed = true;
					check_push_subscribe();
				});
		}
		return false;
	};

	$push_notification_button.on('click', toggle_subscribe);

	if (!navigator.serviceWorker || !('PushManager' in window))
	{
		$('#push-subscription-form #topics').html(
			`<p>this feature only works on browsers that support Service Workers and Push Notifications</p>`
		);
		$.ajax({
			url: "//cdn.jsdelivr.net/caniuse-embed/1.0.1/caniuse-embed.min.js",
			dataType: "script",
			beforeSend: function() {
				var features = ['serviceworkers', 'push-api'];
				var periods = "future_1,current,past_1";

				features.forEach(function(feature) {
					console.log(feature);
					$('#push_notifications_label').append(
						`<p class="ciu_embed"
							data-feature="${feature}"
							data-periods="${periods}">
							<a href="http://caniuse.com/#feat=${feature}">
								Can I Use ${feature}?
							</a>
							Data on support for the ${feature} feature across the major browsers from caniuse.com.
						</p>`);
				});
			}
		});
	}
	else if (Notification.permission === 'denied') {
		$('#push_notifications_label').html(
			`<p>you have blocked notifications!</p>
			<p>if you want to unblock them, see instructions
			<a href="https://support.google.com/chrome/answer/6148059?hl=en-GB&ref_topic=3434353">
				here (Google Chrome)</a>
			(steps for Firefox are very similar)</p>`
		);
	} else {
		$push_notification_button.show();
		
		navigator.serviceWorker.ready
			.then(function(registration) {
				return registration.pushManager.getSubscription();
			})
			.then(function(subscription) {
				if (subscription) {
					is_subscribed = true;
				}
			});
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
			})
			.then(function() {
				callym.message("you have been unsubscribed");
			});

			return;
		}

		var topics = get_topics('email');
		
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
		}).then(function(response) {
			return response.json();
		}).then(function(response) {
			console.log(response);
			if (response.status == 'updated') {
				callym.message("your subscription details have been updated")
			} else if (response.status == 'subscribed') {
				if (response.reason == 'not activated') {
					callym.message("your subscription details have been updated, and you have been sent a new confirmation email");
				} else {
					callym.message("you have been sent a confirmation email");
				}
			} else {
				callym.message("there might have been an error with your subscription, please try again", 'error');
			}
		});
	});

	var check_email_subscribe = function() {
		check_subscribe('email',
		function() {
			callym.message(
				"please select at least one category to subscribe",
				'error');
			$('#email-subscription-button')
				.addClass('error')
				.text('unsubscribe!');
		},
		function() {
			$('#email-subscription-button')
				.removeClass('error')
				.text("subscribe!");
		});
	}
	
	$('#email-subscription-form #topics input[type=checkbox]').on('click', check_email_subscribe);

	if (window.location.search.length > 0) {
		// so the email bit is more central
		$('#container').css(
			'margin-bottom',
			`${$('#email-subscription-form').height() / 2}px`);
		window.getComputedStyle($('#container')[0])['margin-bottom'];

		var urlParams = new URLSearchParams(window.location.search);
		$('#email-subscription-form #email').val(urlParams.get('email'));

		var topics = urlParams.get('topics') || [];

		set_topics('email', topics);
		check_email_subscribe();

		window.location.hash = '#email';
	}
});
</script>