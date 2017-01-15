---
title: "(null) chat"
categories: web text
date: 2016-10-18
description: |
    send messages to the void when you need a chat
descriptionStyle:
    text:
        color: white
    background:
        color: black
layout: empty.nunjucks
---
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>null chat // callym</title>
	<link rel="stylesheet" href="/css/portfolio/null-chat/style.css"/>
</head>
<body>
<div id="callym-com"><a href="/">callym.com</a></div>
<div id="chat-window">
	<div id="message-wrapper">
		<div id="message"></div>
	</div>
	<div id="bottom-bar-wrapper">
		<div id="bottom-bar">
			<div id="input-wrapper">
				<div id="input" contenteditable data-text="write a message..."></div>
			</div>
			<a href="javascript:void(0);" id="send" onclick="doMessage();">
				send!
			</a>
		</div>
	</div>
</div>

<script>
function doMessage() {
	var message_element = document.getElementById("message");
	var input_element = document.getElementById("input");

	if (input_element.innerHTML.length > 0) {
		if (message_element.innerHTML.length > 0) {
			message_element.innerHTML += '<br>';
		}
		message_element.innerHTML += input_element.innerHTML;

		// force repaint
		// ie bug???
		// https://martinwolf.org/blog/2014/06/force-repaint-of-an-element-with-javascript
		message_element.style.display = 'none';
		message_element.offsetHeight;
		message_element.style.display = 'block';
	}
	input_element.innerHTML = "";
};
</script>
</body>