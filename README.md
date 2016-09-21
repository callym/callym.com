# callym.com
this is the github repo for v2 of my portfolio website.

## features
* uses flexbox for the index page and images
* [list.js](https://github.com/callym/list.js) for filtering
* (hopefully!) cross-browser
* uses svgs for loads of cool things!
* PWA!
	* has a dedicated offline page
	* push notifications
		* via AWS Lambda - still a static site!
	* add to home screen

## improvements
* moved away from [Jekyll](https://jekyllrb.com/)
	* Jekyll was super easy to use, but I felt like I was fighting it a lot instead of using it for what it's good for (blogs)
* less hacks!
	* *no* to `-webkit-background-clip: text`
	* *yes* to svg!
* less javascript!
	* can still see portfolio items without javascript on
	* less lazy-loading
		* had loads of issues with css/js not loading and the site being broken, but no more!
	* no hacky background fade animation
		* had this working in CSS but decided to remove it
	* current page link underlining is done at compile time!
* smaller libraries! (file sizes are minified and gzipped)
	* Zepto.js instead of jQuery (~7.9KB vs ~32.5KB)
	* Magnific Popup instead of Colorbox (both roughly the same size)
	* list.js instead of MixItUp (~2.5KB vs ~8KB)
	* cut four unneeded libraries compared to the previous version!
* less CSS! (15KB vs 35KB)

## tools used
* [Metalsmith](http://metalsmith.io) for the html generation
* [gulp](http://gulpjs.com) for other tasks
	* image minification
	* javascript transpiling
	* sass compiling
	* cache busting
* [s3_website](https://github.com/laurilehmijoki/s3_website) for deploying to Amazon S3
