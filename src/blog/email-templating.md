---
title: email templating
categories: web programming
date: 2016-10-04
github_issue: 11
---
When rebuilding my site, I wanted to add some things that
I didn't think were possible before, like
[push notifications](/blog/push-notifications-without-a-server),
and a mailing list,
so people could be kept updated whenever I post a new piece
of work.

I implemented my mailing list
([subscribe here!](/contact/#email))
using a similar system to push notifications:
<p class="center italic">
Javascript ⇒ API Gateway ⇒ Lambda ⇒ DynamoDB
</p>
So I won't explain that again!

I've gotten quite good at using HTML5 and CSS, so when it came
to writing the layouts for my emails, I didn't think it'd be too
difficult!

Oh, how I was **wrong**.

Emails don't use modern HTML or CSS, so you're stuck to using
tables and inline styles.

I ended up using some email templates called
[Cerebus](http://tedgoas.github.io/Cerberus/),
which look sort of like this
```html
<td width="66.66%" class="stack-column-center">
	<table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
		<tr>
			<td dir="ltr" valign="top" style="font-family: sans-serif; font-size: 15px; mso-height-rule: exactly; line-height: 20px; color: #555555; padding: 10px; text-align: left;" class="center-on-narrow">
				<strong style="color:#111111;">Class aptent taciti sociosqu</strong>
				<br><br>
				Maecenas sed ante pellentesque, posuere leo id, eleifend dolor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
				<br><br>
				<table role="presentation" cellspacing="0" cellpadding="0" border="0" class="center-on-narrow" style="float:left;">
					<tr>
						<td style="border-radius: 3px; background: #222222; text-align: center;" class="button-td">
							<a href="http://www.google.com" style="background: #222222; border: 15px solid #222222; font-family: sans-serif; font-size: 13px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 3px; font-weight: bold;" class="button-a">
								&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ffffff">A Button</span>&nbsp;&nbsp;&nbsp;&nbsp;
							</a>
						</td>
					</tr>
				</table>  
			</td>
		</tr>
	</table>
</td>
```
I don't know about you, but to me, that's basically unreadable.
What happened to separation of concerns, semantic tags, and 
all that other stuff that's happened since the 90s?
(or at least, way before I got involved in the web!)
I remember having to write a website in school, and even then,
we used `<div>` and CSS!

There had to be a better way.

I knew that I had to use these tags, but that doesn't mean I had to see them!
I wanted to keep my email workflow similar to my 
website one, which means using the
[Nunjucks](https://mozilla.github.io/nunjucks/)
templating language, and 
[YAML](http://yaml.org/) data.

The first thing I did was to take as much of the page
as I could, and shove it into
```twig
{% include "email/templates/partials/header.nunjucks" %}
…
{% include "email/templates/partials/footer.nunjucks" %}
```
This hid away all the boilerplate, the header image,
setting a pretext, stuff that needed to be done for 
every email.

Next, I hacked away at the Cerebus templates,
separating as much of it as possible into reusable
Nunjucks macros, such as
```twig
{% macro button(text, link, big = false) %}
{% set button_style = "button small" %}
{% if big %}
	{% set button_style = "button big" %}
{% endif %}
<!-- Button : Begin -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="center-on-narrow" style="margin: auto;">
	<tr>
		<td class="button-td button-wrapper">
			<a href="{{ link }}" class="button-a {{ button_style }}">
				<span style="color:#ffffff">{{ text }}</span>
			</a>
		</td>
	</tr>
</table>
<!-- Button : END -->
{% endmacro %}
```
Which can then be called in a template like this
```twig
{{ button("this is a big button", "http://link.here", true) }}
```
I ended up with quite a big list of macros:
* hero images
* buttons
* images with text next to them
* one column text
* two column text
* empty spacers
* rounded corner sections

Armed with my new macros, a template can look like this instead
```twig
{% include "email/templates/partials/header.nunjucks" %}
{% from "email/templates/partials/components.nunjucks" import
	one_column_begin,
	one_column_end,
	section_begin,
	section_end,
	thumbnail_item_begin,
	thumbnail_item_end,
	clear_spacer %}

{{ one_column_begin() }}
	{{ description }}
{{ one_column_end() }}
{{ section_end() }}

{{ clear_spacer() }}

{{ section_begin() }}
{% for dog in dogs %}
	{{ thumbnail_item_begin('',
		assets_path + dog.image + '_thumbnail.jpg',
		image_alt = dog.alt,
		link = assets_path + dog.image + '.jpg',
		left = ((loop.index0 % 2) == 0)) }}
		{{ dog.caption }}
	{{ thumbnail_item_end() }}
{% endfor %}
{{ section_end() }}

{% include "email/templates/partials/footer.nunjucks" %}
```

It doesn't really look like HTML, but it's a **lot** simpler than
the soup of table tags that I had at the beginning!
And because it's all done in Nunjucks, through node.js, 
like my website, I can use all the cool Javascript things 
that I've gotten used to,
like YAML to describe the contents of an email, 
which looks like:
```yaml
---
template: dogs
title: woof woof
description: look at all these doggies being good boys
dogs:
    -   image: shiba-pumpkin
        alt: a shiba biting a pumpkin
        caption: >-
            look at this shiba biting a little
            baby pumpkin, so cute!			
    -   image: shiba-avocado
        alt: a shiba with an avocado in its mouth
        caption: >-
            this shiba is all about the ~clean eating~
            life
```

The process for making an email starts with parsing the 
YAML file, then collecting data from DynamoDB,
such as the list of emails that have subscribed to the email topic,
and then for each email, parsing the template with both the 
email data, and the email data, and then the result of that 
is sent via Amazon SES.
<p class="center">
(YAML + DynamoDB) ⇒ Nunjucks ⇒ nodemailer ⇒ AWS SES
</p>
When you register an email address, it also sends you a confirmation
email, which is done through a Lambda function,
and uses a precompiled template, where the nice macro layout is
expanded into a bunch of HTML tags, CSS is inlined, and the whole
thing is minified, so you're left with a big pile of HTML, and 
a few `{{ email }}`, etc. tags scattered about.