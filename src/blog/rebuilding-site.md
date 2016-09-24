---
title: rebuilding callym.com
categories: web programming
date: 2016-09-20
---
The original callym.com was built using [Jekyll](http://jekyllrb.com),
a really easy-to-use static blog generator.

A big part of why I built my site from scratch in the beginning is
~~because I'm a massive nerd~~
my love for the web as a platform,
but I found that Jekyll wasn't ideal for what I was trying to do,
so after my work building the portfolio site for
[RUSKIN.SHOW](http://www.rsa.ox.ac.uk/degreeshow/2016/artists/),
I decided to re-write my website using [Metalsmith](http://metalsmith.io)
and [gulp](http://gulpjs.com/).

Escaped from the shackles of Jekyll
(ok so it was nowhere near as bad as I'm making out...),
I had to look at what my new site needed to do.
* keep the same link structure as the old version [↘](#link-structure)
* be at least as fast [↘](#speed)
* easy to add new content [↘](#new-content)
* explore new and exciting web technology [↘](#new-technology)

# link structure
The first point was easy, all my portfolio pages are in the 
`/portfolio/` subdirectory - the only difficult part was
[CAL ARTS: +6](/portfolio/calarts),
which had to be accessible from both `callym.com/calarts`
and `/portfolio/calarts/`, but
[metalsmith-alias](https://github.com/callym/metalsmith-alias)
made that simple as well!
(It uses a HTML redirect, which I think is considered bad practice,
but as this site has to run without a server, it's probably fine?)
(`/portfolio/` redirects back to `/` as the portfolio index is the homepage.)

# speed
The second - speed! - is a constant struggle.
My site is image-heavy by nature, so I had to look at alternatives to make it fast,
& switching over to square images instead of rectangles
(squares look a LOT better!)
means that the images are a lot bigger than previously.

## images
The first thing I did was add `.webp` images using [gulp-responsive](https://github.com/mahnunchik/gulp-responsive).
WebP images are a lot smaller than jpegs, but this only helps Chrome browsers.
I also reduced the quality of the thumbnails, which helped, 
but there's only so far you can bring the quality down until the images look bad.

With the image sizes optimised to be as small as I could get away with,
I had to start looking at other places I could cut down,
which led me to look at my Javascript.

## javascript
The old version of my site uses jQuery in quite a few places,
mostly for the libraries used for portfolio filtering, lightboxing, etc.
I still need these features, so how to cut down? 

The first thing I did was switch to
[Magnific Popup](http://dimsemenov.com/plugins/magnific-popup/),
a small lightbox library
which comes with zero images!
(The previous library used a spritesheet for controls -
which I had base64 inlined into my css),
and let me cut out loads of optional pieces of code!

Next was to drop jQuery completely - and switch to [Zepto](http://zeptojs.com/),
which is a lot smaller - especially as I only need the `event`, `ie` & `fx` modules!
(~7.9KB minified+gzipped compared to ~32.5KB)

Zepto is apparently slower than jQuery, but as it's only used in a handful of places,
this doesn't really bother me.

Next was to drop MixItUp, the filtering library I used, and switch to my fork of
[list.js](https://github.com/callym/list.js).
List.js was already (slightly) smaller than MixItUp, and without a jQuery dependency,
and in my fork I stripped all the other things it did, so I'm left with a tiny
library that only filters! (~2.5KB vs ~8KB).

There were also a handful of plugins that I was using that I could strip out 
completely, such as 
a nice colour generator,
a touch swipe plugin, 
and an image selector used exclusively in my [#horoscopes](/portfolio/horoscopes/) piece...

All this took me down to
**~16.8KB** gzip and minified / ~48.4KB minified only,
compared to
**~24.1KB** / 76.8KB.
Which doesn't seem like a lot... until I looked at the source of my site,
and realised that my jQuery was coming from Google, so adding that to my JS 
totals, and you get:<br>
~24.1KB + ~33.4KB = **~57.5KB** (gzip + minified)<br>
~76.8KB + ~94.0KB = **~170.8KB** (just minified)!

So I managed to
*a)* cut my Javascript by **~71%**, and
*b)* remove an extra HTTP request (from loading jQuery from Google's CDN),
all while keeping the same functionality of my old site! Not bad!

## hosting
Both my old site and my new site are hosted on Amazon S3, with CloudFront in front,
which with its recent HTTP2 support, speeds my site up even more!
I didn't change anything here, hosting is super cheap and super simple,
but the limitations of a static site has led me down some interesting paths.

I managed to reduce my homepage down from **~315KB** to **~265KB** despite adding
five more portfolio pieces!

I also managed to cut my CSS from **~35KB** to **~15KB**,
with room left for improvement.

Overall, the site feels a lot faster!
The old site wasn't exactly slow, but now it feels super smooth,
even on my phone.

# new content
Content on this site is added through YAML/Markdown files.
For example, the page for [tides](/portfolio/tides/) looks like
```yaml 
---
title: digital spaces
categories: 3d video
date: 2014-11-04
images:
    -   file: "1"
        type: "image"
        alt: "a test at photorealism (Luxrender)"
    -   file: "2"
        type: "image"
        alt: "simple test (Mitsuba)"
    -   file: "3"
        type: "image"
        alt: "submission for Notes Magazine (Cycles)"
    -   file: "v1"
        type: "vimeo"
        alt: "animated camera test (Cycles)"
        id: 110880449
    -   file: "v2"
        type: "vimeo"
        alt: "animation test (Luxrender)"
        id: 116711874
---
an experiment with 3d digital spaces, these images show spaces that do not
physically exist.

using technology to create what could be described as "digital sculpture" is a way
of challenging the physically plausible by constructing in a virtual space.
```

This is incredibly similar to the previous data structure,
which looked like:

```yaml
---
layout: portfolio_entry
title: digital spaces
categories: 3d video
date: 2014-11-04
description: 3d environments
images: 3
videos:
- 110880449
- 116711874
---
an experiment with 3d digital spaces, these images show spaces that do not physically exist.

using technology to create what could be described as "digital sculpture" is a way
of challenging the physically plausible by constructing in a virtual space.
```

I changed a few things in the change to the new site,
firstly, I got rid of the `layout: portfolio_entry` section,
it is now added automatically based on what subfolder the file is in.
I also removed `description:` from a lot of the files, if it is missing,
the description tag is created from a truncated version of the contents,
which works quite well (and is what I used for RUSKIN.SHOW).
I also unified images and videos.

This was a massive change back-end, before, all videos were always
added to the end of the page gallery, and the code was copied
between images and videos, making changing anything really difficult,
as you had to copy it from images, into videos, then change it so videos worked
again.

Now, there's a tiny if-loop that just changes a css class and the
link (whether to an image or to a vimeo page). Everything else is 
exactly the same for images and videos, and you can have videos
mixed in with images!

I also changed it so `file:` takes a filename
(it's still 1, 2, 3... in all the old pages),
& you can (and should!) add an alt tag to images.
The alt tag is also used for a title below the image in the lightbox.
Before, `images` is used to specify how many images there are, and 
they have to be named `1.jpg`, `2.jpg`, ... `n.jpg`,
while videos are `v1.jpg`, `v2.jpg`, `v3.jpg`, ...`vn.jpg`.

So the code is *slightly* longer,
but to change the order of the images, you change the yaml, not the filenames, 
adding a new type of content (say an iframe to an external site), is one change
in one part of the code, instead of requiring copying a massive bit of code 
and keeping it synced up,
and you can add titles to images!
Seems worth it to me.

I also switched to SVG on the homepage for pieces that don't have images.
The SVG is generated from the description of the piece,
and uses CSS variables to progressively enhance the colours to fit the piece.
(This could probably be changed to inline css and then it'd work almost everywhere...)
The old site used a generic (and quite ugly) placeholder image, 
which made it look like I had just forgotten to add an image.

This doesn't (currently) work in Internet Explorer due to lack of `<foreignObject>` support.
[github issue](https://github.com/callym/callym.com/issues/3)

# new technology
There's a lot of exciting things going on in the web at the moment,
such as:

* progressive web apps
* push notifications
* native APIs (Bluetooth, location, battery)
* offline-first experiences
* WebGL

Some of these (native APIs, WebGL) are exciting because of the art they could facilitate,
but I can't really imagine how I'd use them in making this site.

Others are exciting because they work to blur the line between the web and native apps.
These are the ones that I've worked on adding to this site.

First thing I had to do was serve my site over HTTPS,
as that's needed for Service Workers, which enable loads of other cool things.
This was super easy, thanks to AWS.

Then I added some caching -
of the site css,
an offline page,
the glitter .gif used in the header,
and some notification icons.

There are various ways to make a site work offline using Service Workers, 
and I haven't decided on a good one yet,
as they all seem to have negatives,
so at the moment if you load my site offline, it'll take you to an
[offline page](/offline/).

Service workers make a lot of other cool things possible,
things that are more exciting than a useless offline page,
but now my site meets Google's Add To Homescreen requirements,
which means if someone does visit my page often enough,
they'll be prompted to add it to their home screen, meaning they'll hopefully
visit again!
