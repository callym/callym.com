


/*
* @version  0.9.1
* @author   Lauri Rooden <lauri@rooden.ee>
* @license  MIT License
*/



!function(Date, proto) {
	var maskRe = /("|')((?:\\?.)*?)\1|([YMD])\3\3\3?|([YMDHhmsWSZ])(\4?)|[uUASwoQ]/g
	, dateRe = /(\d+)[-.\/](\d+)[-.\/](\d+)/
	, timeRe = /(\d+):(\d+)(?::(\d+))?(\.\d+)?(?:\s*(?:(a)|(p))\.?m\.?)?(\s*(?:Z|GMT|UTC)?(?:([-+]\d\d):?(\d\d)?)?)?/i
	, unescapeRe = /\\(.)/g
	, map = { D:"Date", h:"Hours", m:"Minutes", s:"Seconds", S:"Milliseconds" }
	, units = {
		days: 86400000,
		hours: 3600000,
		minutes: 60000,
		seconds: 1000,
		weeks: 604800000
	}

	//, isoDateRe = /(\d{4})[-.\/]W(\d\d?)[-.\/](\d)/


	// ISO 8601 specifies numeric representations of date and time.
	//
	// The international standard date notation is
	// YYYY-MM-DD
	//
	// The international standard notation for the time of day is
	// hh:mm:ss
	//
	// Time zone
	//
	// The strings +hh:mm, +hhmm, or +hh (ahead of UTC)
	// -hh:mm, -hhmm, or -hh (time zones west of the zero meridian, which are behind UTC)
	//
	// 12:00Z = 13:00+01:00 = 0700-0500

	Date[proto].date = Date[proto].format = function(mask, _zone) {
		mask = Date.masks[mask] || mask || Date.masks["default"]

		var undef, zonediff
		, date = this
		, origin = +date
		, get = "get" + (mask.slice(0, 4) == "UTC:" ? (mask = mask.slice(4), "UTC") : "")
		, zone = _zone == undef ? date._z : _zone

		if (zone != undef && get == "get") {
			get = "getUTC"
			date.setTime( origin + (36e5 * zone) )
			zonediff = 60 * zone
		}

		mask = mask.replace(maskRe, function(match, quote, text, MD, single, pad) {
			text = MD == "Y"  ? date[get + "FullYear"]()
			: MD              ? Date.names[ date[get + (MD == "M" ? "Month" : "Day" ) ]() + ( match == "DDD" ? 24 : MD == "D" ? 31 : match == "MMM" ? 0 : 12 ) ]
			: single == "Y"   ? date[get + "FullYear"]() % 100
			: single == "W"   ? ( quote = new Date(origin + ((4 - (date[get + "Day"]()||7)) * 86400000))
			                    , Math.ceil(((quote.getTime() - quote["s" + get.slice(1) + "Month"](0, 1)) / 86400000 + 1 ) / 7)
					    )
			: single == "M"   ? date[get + "Month"]() + 1
			: single == "H"   ? date[get + "Hours"]() % 12 || 12
			: single == "Z"   ? ( quote = zonediff || get == "get" && -date.getTimezoneOffset() || 0
				, quote ? (quote < 0 ? ((quote=-quote), "-") : "+") + (quote < 600 ? "0" : "") + (0|(quote/60)) + ((quote%=60) ? (pad ? "" : ":") + quote : "") : "Z"
			)
			: single          ? date[get + map[single]]()
			: match == "u"    ? (date/1000)>>>0
			: match == "U"    ? origin
			: match == "Q"    ? ((date[get + "Month"]()/3)|0) + 1
			: match == "A"    ? Date[date[get + "Hours"]() > 11 ? "pm" : "am"]
			: match == "w"    ? date[get + "Day"]() || 7
			: match == "o"    ? new Date(origin + ((4 - (date[get + "Day"]()||7)) * 86400000))[get + "FullYear"]()
			: quote           ? text.replace(unescapeRe, "$1")
			: match
			if (match == "SS" && text < 100) {
				text = "0" + text
			}
			return pad && text < 10 && single != "Z" ? "0" + text : text
		})
		if (zonediff != undef) {
			date.setTime(origin)
		}
		return mask
	}

	Date.am = "am"
	Date.pm = "pm"

	Date.masks = {
		"default": "DDD MMM DD YYYY hh:mm:ss",
		"iso": "UTC:YYYY-MM-DD'T'hh:mm:ss'Z'"
	}
	Date.names = "JanFebMarAprMayJunJulAugSepOctNovDecJanuaryFebruaryMarchAprilMayJuneJulyAugustSeptemberOctoberNovemberDecemberSunMonTueWedThuFriSatSundayMondayTuesdayWednesdayThursdayFridaySaturday".match(/.[a-z]+/g)
}(Date, "prototype");