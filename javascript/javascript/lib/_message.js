if(!window.callym)
	window.callym = {};

(function(){
	function info(text, classes) {
		if (!t.area) {
			t.area = document.createElement("DIV");
			t.area.className = "message_area";
			t.area.style[t.position] = "5px";
			document.body.appendChild(t.area);
		}

		t.hide(text.id);
		var message = document.createElement("DIV");
		message.innerHTML = `<div>${text.text}</div>`;
		message.className = "info " + classes;
		message.onclick = function() {
			t.hide(text.id);
			text = null;
		};

		if (t.position == "bottom" && t.area.firstChild) {
			t.area.insertBefore(message, t.area.firstChild);
		}
		else {
			t.area.appendChild(message);
		}
		
		if (text.expire > 0) {
			t.timers[text.id] = window.setTimeout(function(){
				t.hide(text.id);
			}, text.expire);
		}

		window.getComputedStyle(message).opacity;
		message.classList.add('visible');

		t.pull[text.id] = message;
		message = null;

		return text.id;
	}

	function params(text) {
		if (typeof text != "object") {
			text = {
				text: text
			};
		}

		text.id = text.id || t.uid();
		text.expire = text.expire || t.expire;
		text.position = text.position || t.position;
		return text;
	}

	var t = callym.message = function(text, classes) {
		text = params(text);

		return info(text, classes);
	};

	t.seed = (new Date()).valueOf();
	t.uid = () => t.seed++;
	t.expire = 4000;
	t.keyboard = true;
	t.position = "bottom";
	t.pull = {};
	t.timers = {};

	if (!t.area) {
		t.area = document.createElement("DIV");
		t.area.className = "message_area";
		t.area.style[t.position] = "5px";
		document.body.appendChild(t.area);
	}

	t.hide = function(id) {
		var obj = t.pull[id];
		if (obj && obj.parentNode) {
			obj.style.height = obj.clientHeight;

			obj.classList.remove('visible');
			obj.addEventListener('transitionend', function() {
				if (obj && obj.parentNode) {
					obj.parentNode.removeChild(obj);
					obj = null;
				}
			});
			obj.classList.add('slide-off');
			
			if (t.timers[id]) {
				window.clearTimeout(t.timers[id])
			};
			delete t.pull[id];
		}
	};
})();