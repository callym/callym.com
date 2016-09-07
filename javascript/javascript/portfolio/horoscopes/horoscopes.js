//=require _mersenne-twister.js

var s_planets = ['Saturn', 'the Moon', 'Mars', 'Pluto', 'Venus', 'Uranus', 'Neptune', 'Mercury', 'Jupiter'];

var s_connections = ['transcends', 'overlaps', 'rules'];

var s_signs = ['Aries', 'Taurus', "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

var s_colours = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black', 'white'];

var s_socialNetworks = ['Twitter', 'Facebook', 'Pinterest', 'Tumblr', 'MySpace'];

var s_relationships = ['significant other', 'family member', 'close friend', 'lover', 'romantic interest'];

var s_ratings = ['good', 'bad', 'great', 'terrible', 'mediocre', 'sub-par'];

var snippets = [["planet",          s_planets],
				["connection",      s_connections],
				["sign",            s_signs],
				["colour",          s_colours],
				["socialNetwork",   s_socialNetworks],
				["relationship",    s_relationships],
				["rating",          s_ratings]];

var h_relationship = [
"A [relationship]'s [socialNetwork] feed will show their true colours.",
"Your family and home life demands more of you at the moment.",
"Differences of opinion will reveal themselves through [socialNetwork].",
"You have to think, is a [sign] really what you need in your life at the moment?",
"While [planet] [connection] you, texting back a crush may be risky.",
"You need to establish healthy boundaries when it comes to a certain [relationship].",
"A [relationship] disapproves with your attitude at the moment.",
"Try to not be too judgemental of your [relationship]'s [socialNetwork].",
"Stop waiting for them to text back, open your eyes and you will find who you truly need.",
"A speedy reply to that message will bring you positive energy.",
"An email exchange with a fellow [currentsign] could be fruitful.",
"Giving up is always an option.",
"It might be a good time to use all means necessary to get who you want.",
"Make sure you aren't being too impulsive while [planet] [connection] you.",
"Trust your instincts.",
"Somebody with a refreshing aura will enter your life.",
"You don't need their approval to validate your existance."
];

var h_aesthetic = [
"Wearing [colour] reflects your relationship with [planet] at the moment. This heightens the already [rating] energy in your life.",
"Dress to impress.",
"A post on [socialNetwork] will inspire you.",
"Now is a good time to add some [colour] to your wardrobe.",
"Changing your aesthetic will bring you positive energy, but try not to spend too much money.",
"Your image is stale, it is time to splash out on that new look you've been too scared to try.",
"A new [socialNetwork] post will change your personal philosophy.",
"Today is a good day to try that new look.",
"Spending all day looking at [socialNetwork] can be more productive than socialising.",
"Remember - the only true goth colour is black.",
"Obsessions don't come about for no reason. Follow it up.",
"All you can be is who you truly are."
];

var h_spiritual = [
"There is a [rating] astral scene to carry out long-term projects at the moment.",
"This is a [rating] time to develop spiritually.",
"A bit of spring cleaning will bring new energy into your life.",
"It is time to make a fresh start.",
"Spending time in nature will give your aura a much needed refresh.",
"The connection between you and [planet] will give you the strength to break destructive habits.",
"Being around water will wash away negative energy.",
"Direct your energy wisely.",
"A wave of [rating] energy is going to crash into you. Prepare yourself.",
"Indirect tweeting never gets you anywhere. Let it go, and [planet] will reward you.",
"Everyone is fighting their own battles. Spread positive energy.",
"It is okay to lose control.",
"Everything passes, including this [rating] energy.",
"Clinging to the past is never productive."
];

var horoscopes = [h_relationship, h_aesthetic, h_spiritual];

var currentHoroscope = "";
var currentHoroscopeIndex = 0;
var m = Math;

var date = new Date();

document.addEventListener("DOMContentLoaded", function(event) {

	$("#sign-list div").each(function(index) {
		var sign = $(this).data('sign');
		var icon = "icons/" + sign + ".png";
		$(this).html(`
			<img src="${icon}"></img>
			<div class="caption center">${sign}</div>
		`);
		$(this).on('click', function(event) {
			$("#sign-list .active").removeClass("active");
			currentHoroscope = sign;
			currentHoroscopeIndex = index;
			this.classList.add('active');

			date = new Date();
			m = createTwister();

			$("#horoscope-sign").text(currentHoroscope);
			$("#horoscope-date").text(date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear());
			$("#horoscope-text").html(getHoroscopeResults());
		});
	});

	$('#sign-list').children().first().trigger('click');
});

function getHoroscopeResults() {
	var text = "";

	for (var i = 0; i < horoscopes.length; i++)
	{
		text += getRandomItem(horoscopes[i]);
		text += "<br/>";
	}

	return text;
}

function getRandomItem(arr) {
	var stringtoreturn = arr[Math.floor(m.random() * arr.length)];
	return parseHoroscopeString(stringtoreturn);
}

function parseHoroscopeString(horoscopeString) {
	if ((horoscopeString.indexOf("[") > -1) && (horoscopeString.indexOf("]") > -1))
	{
		var s = horoscopeString;

		for (var i = 0; i < snippets.length; i++)
		{
			var re = new RegExp("\\[" + snippets[i][0] + "\\]", "g");
			/* replace using regexp above using a random item generated by getRandomItem */
			var ss = s.replace(re, function(){return getRandomItem(snippets[i][1]);});
			s = ss;
		}

		var sCurSign = s.replace(/\[currentsign\]/g, currentHoroscope);

		horoscopeString = sCurSign;
	}

	return horoscopeString;
}

function createTwister() {
	var year = date.getFullYear().toString();
	var month = date.getMonth().toString();
	var day = date.getDate().toString();

	var longdate = currentHoroscopeIndex.toString() + day + month + year;
	var longdatenumber = parseInt(longdate);

	return new MersenneTwister(longdatenumber);
}