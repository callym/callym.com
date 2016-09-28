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
				callym.message("you have been unsubscribed");
				remove_topics('email');
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

	$('#email-subscription-form #email').on('input', function() {
		var email = get_from_storage('email').email;

		var text = "subscribe!";
		if (email && email == $(this).val()) {
			text = "change!";
		}

		$('#email-subscription-button')
			.removeClass('error')
			.text(text);
	});

	if (window.location.search.length > 0) {
		// so the email bit is more central
		$('body').css('height', '150vh');

		var urlParams = new URLSearchParams(window.location.search);
		window.location.hash = '#email';
		$('#email-subscription-form #email').val(urlParams.get('email'));

		var topics = urlParams.get('topics') || [];

		set_topics('email', topics);
		check_email_subscribe();
	} else {
		set_topics_from_storage('email');
		var email = get_from_storage('email').email;

		if (email) {
			$('#email-subscription-form #email').val(email);
		}
	}
});
</script>