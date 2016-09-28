---
title: subscribed
hide: true
---
<div id="subscribing" class="offline-text">
	subscribing...
</div>
<div class="offline-emoji">	
	<svg xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 64 64"
		enable-background="new 0 0 64 64">
		<path d="M62,32c0,16.6-13.4,30-30,30C15.4,62,2,48.6,2,32C2,15.4,15.4,2,32,2C48.6,2,62,15.4,62,32z" fill="#ffdd67"/><g fill="#f46767"><path d="m61.8 13.2c-.5-2.7-2-4.9-4.5-5.6-2.7-.7-5.1.3-7.4 2.7-1.3-3.6-3.3-6.3-6.5-7.7-3.2-1.4-6.4-.4-8.4 2.1-2.1 2.6-2.9 6.7-.7 12 2.1 5 11.4 15 11.7 15.3.4-.2 10.8-6.7 13.3-9.9 2.5-3.1 3-6.2 2.5-8.9"/><path d="m29 4.7c-2-2.5-5.2-3.5-8.4-2.1-3.2 1.4-5.2 4.1-6.5 7.7-2.4-2.3-4.8-3.4-7.5-2.6-2.4.7-4 2.9-4.5 5.6-.5 2.6.1 5.8 2.5 8.9 2.6 3.1 13 9.6 13.4 9.8.3-.3 9.6-10.3 11.7-15.3 2.2-5.3 1.4-9.3-.7-12"/></g><path d="m49 38.1c0-.8-.5-1.8-1.8-2.1-3.5-.7-8.6-1.3-15.2-1.3-6.6 0-11.7.7-15.2 1.3-1.4.3-1.8 1.3-1.8 2.1 0 7.3 5.6 14.6 17 14.6 11.4-.1 17-7.4 17-14.6" fill="#664e27"/><path d="m44.7 38.3c-2.2-.4-6.8-1-12.7-1-5.9 0-10.5.6-12.7 1-1.3.2-1.4.7-1.3 1.5.1.4.1 1 .3 1.6.1.6.3.9 1.3.8 1.9-.2 23-.2 24.9 0 1 .1 1.1-.2 1.3-.8.1-.6.2-1.1.3-1.6 0-.8-.1-1.3-1.4-1.5" fill="#fff"/>
	</svg>
</div>

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

	var get_from_storage = function(type) {
		var data = localStorage[`${type}-notification`];

		if (data == undefined) {
			data = null;
		} else {
			data = JSON.parse(data);
		}

		return data;
	}

	var get_topics_from_storage = function(type) {
		var topics = get_from_storage(type);
		
		if (topics) {
			if (topics.topics == undefined) {
				topics = null;
			} else {
				topics = topics.topics;
			}
		}

		return topics;
	}

	var save_topics = function(type, obj) {
		obj = obj || {};
		var topics = get_topics(type);
		obj.topics = obj.topics || topics;
		console.log(JSON.stringify(obj));

		localStorage[`${type}-notification`] = JSON.stringify(obj);
	}

	var remove_topics = function(type) {
		localStorage.removeItem(`${type}-notification`);
	}

	var set_topics = function(type, topics) {
		console.log(topics);

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

	var set_topics_from_storage = function(type) {
		set_topics(type, get_topics_from_storage(type));
	}

	var has_changed = function(type) {
		var changed = false;

		var new_topics = get_topics(type);
		var old_topics = get_topics_from_storage(type);

		if (old_topics == null) {
			changed = true;
		}

		if (!changed) {
			old_topics.forEach(function(topic) {
				if (new_topics.indexOf(topic) === -1) {
					changed = true;
					return;
				}
			});
		}

		if (!changed) {
			new_topics.forEach(function(topic) {
				if (old_topics.indexOf(topic) === -1) {
					changed = true;
					return;
				}
			});
		}

		return changed;
	}

	var is_subscribed = false;
	var $push_notification_button = $('#push_notifications_action');

	var update_message = function() {
		
	};

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
			$push_notification_button.removeClass('error');

			var changed = has_changed('push');

			if (changed && is_subscribed) {
				$push_notification_button.html("change!");
			} else {
				$push_notification_button.html("subscribe!");
			}
		});
	}

	$('#push-subscription-form #topics input[type=checkbox]').on('click', check_push_subscribe);

	var toggle_subscribe = function() {
		// unsubscribe!
		if ($(this).hasClass('error')) {
			push_unsubscribe()
				.then(function() {
					remove_topics('push');
					is_subscribed = false;
					check_push_subscribe();
				});
		}
		else {
			push_subscribe(get_topics('push'))
				.then(function() {
					save_topics('push');
					is_subscribed = true;
					check_push_subscribe();
				});
		}
		return false;
	};

	$push_notification_button.on('click', toggle_subscribe);

	if (!navigator.serviceWorker || !('PushManager' in window))
	{
		$('#push_notifications_label').html(
			`<p>your web browser doesn't support Service Workers or Push Notifications</p>
			<p>for more information about what browsers do, check
			<a href="http://caniuse.com/#feat=push-api">here</a></p>`
		);
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
			})
			.then(function() {
				remove_topics('email');
			});
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
		}).then(function() {
			callym.message("you have been sent a confirmation email");
			save_topics('email', subscription);
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
			var changed = has_changed('email');

			var text = "change!";
			if (!changed) {
				text = "subscribe!";
			}

			$('#email-subscription-button')
				.removeClass('error')
				.text(text);
		});
	}
	
	$('#email-subscription-form #topics input[type=checkbox]').on('click', check_email_subscribe);

	if (window.location.search.length > 0) {
		var urlParams = new URLSearchParams(window.location.search);
		var email = urlParams.get('email');
		var date = urlParams.get('date');

		var data = {
			email: email,
			date: date
		};

		console.log(JSON.stringify(data));

		fetch('https://z8jnhu3g0g.execute-api.eu-west-1.amazonaws.com/production/confirm', {
			method: 'post',
			headers: {
				'Content-type' : 'application/json'
			},
			body: JSON.stringify(data)
		}).then(function(response) {
			if (!response.ok) {
				$('#subscribing').text('there seems to be an error, try refreshing the page, or resubscribing');
			} else {
				$('#subscribing').text('you are now subscribed to callym.com!');
			}
		});
	} else {
		$('#subscribing').text('this link is invalid, please try resubscribing!');
	}
});
</script>