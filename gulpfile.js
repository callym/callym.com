var gulp = require('gulp'),
	gulp_front_matter = require('gulp-front-matter'),
	fs = require('fs'),
	through = require('through2'),
	_ = require('lodash'),
	assign = _.assign,
	template = require('gulp-template'),
	clean = require('gulp-clean'),
	plumber = require('gulp-plumber'),
	gutil = require('gulp-util'),
	gif = require('gulp-if'),
	lazypipe = require('lazypipe'),
	es = require('event-stream'),
	moment = require('moment'),
	connect = require('gulp-connect'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	responsive = require('gulp-responsive'),
	rename = require('gulp-rename'),
	rev = require('gulp-rev'),
	revD = require('rev-del'),
	revR = require('gulp-rev-replace'),
	filter = require('gulp-filter'),
	include = require('gulp-include'),
	babel = require('gulp-babel'),
	runSequence = require('run-sequence');

var gulpsmith = require('gulpsmith'),
	markdown = require('metalsmith-markdown'),
	layouts = require('metalsmith-layouts'),
	permalinks = require('metalsmith-permalinks'),
	collections = require('metalsmith-collections'),
	root = require('metalsmith-rootpath'),
	branch = require('metalsmith-branch'),
	copy = require('metalsmith-copy'),
	ignore = require('metalsmith-ignore'),
	alias = require('metalsmith-alias'),
	htmlMinifier = require('metalsmith-html-minifier'),
	nunjucks = require('nunjucks'),
	njDate = require('nunjucks-date-filter')
	njMD = require('nunjucks-markdown-filter');

var gulp_src = gulp.src;
gulp.src = function() {
	return gulp_src.apply(gulp, arguments)
		.pipe(plumber(function(error) {
			// Output an error message
			gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
			// emit the end event, to properly end the task
			this.emit('end');
		}));
};

var build = false;
var now = moment().format("DD-MMM-YYYY-HH-mm-ss-SS");

var noop = through.obj(function(file, enc, cb) {
	cb(null, file);
});

var rev_pipe = lazypipe()
	.pipe(gutil.noop);

nunjucks.configure('', {
	watch: false,
	noCache: true,
})
.addFilter('date', njDate)
.addFilter('md', njMD)
.addGlobal('now', now);

var babel_presets = ['latest'];

var babel_options = {
	presets: babel_presets,
	comments: build ? false : true,
	compact: build ? true : false
};

var set_build = function() {
	// this function should be used when
	// ready to deploy!
	// should do things like compress
	// minify
	// etc
	build = true;
	rev_pipe = rev_pipe.pipe(rev);
	babel_presets.push('babili');
};

var assign_layout = function(options) {
	return function (files, metalsmith, done) {
		var metadata = metalsmith.metadata();
		Object.keys(files).forEach(function(file) {
			if (file == null) {
				return;
			}

			var data = files[file];

			if (data.layout != null) {
				return;
			}
			
			if (options.hasOwnProperty(data.collection[0])) {
				data.layout = options[data.collection[0]];
			}
		});

		done();      
	};
};

gulp.task('default', function(cb) {
	console.log("*** build: " + build + " ***");
	return runSequence(
		'clean',
		['metalsmith', 'sass', 'images', 'assets', 'javascript'],
		'cache-bust',
		cb);
});

gulp.task('build', ['resize-images'], function(cb) {
	set_build();
	return runSequence(
		'default',
		cb);
});

gulp.task('watch', ['connect', 'default'], function() {
	gulp.watch('src/**/*', ['metalsmith']);
	gulp.watch('layouts/**/*', ['metalsmith']);
	gulp.watch('sass/**/*', ['sass']);
//	gulp.watch('images/**/*', ['images']);
	gulp.watch('assets/**/*', ['assets']);
	gulp.watch('javascript/**/*', ['javascript']);
});

gulp.task('connect', function() {
	connect.server({
		root: './build',
		livereload: true
	});
});

gulp.task('livereload', function() {
	now = moment().format("DD-MMM-YYYY-HH-mm-ss-SS");
	return gulp.src("./build/**/*")
		.pipe(connect.reload());
});

gulp.task('metalsmith', function() {
	var use_markdown = (file, props, i) => test_markdown(file, props, i);
	var dont_use_markdown = (file, props, i) => !test_markdown(file, props, i);
	var test_markdown = function(file, props, i) {
		if (props.layout == "empty.nunjucks") {
			return false;
		}
		return true;
	};

	var rename_markdown = function(options) {
		return function (files, metalsmith, done) {
			Object.keys(files).forEach(function(file) {
				var data = files[file];
				var html = file.replace(/\.md$/, ".html");
				delete files[file];
				files[html] = data;
			});
			done();      
		};
	};

	var log = function(file, props, i) {
		console.log(file);
		_.forOwn(props, function(value, key) {
			if (key != "contents")
			{
				console.log("    " + key + ": " + value);
			}
		});
		return true;
	}

	gulp.src("./src/**/*")
		.pipe(gif(["**/*", "!**/*.{jpg,png}"], gulp_front_matter().on("data", function(file) {
			assign(file, file.frontMatter);
			delete file.frontMatter;
		}))).pipe(
			gulpsmith()
				.use(collections({
					standalone: {
						pattern: 'standalone/**/*.md'
					},
					empty: {
						pattern: '**/*.html'
					},
					page: {
						pattern: 'pages/**/*.md'
					},
					portfolio: {
						pattern: 'portfolio/**/*.md',
						sortBy: 'date',
						reverse: true
					}
				}))
				.use(assign_layout({
					standalone: 'empty.nunjucks',
					empty: 'empty.nunjucks',
					page: 'page.nunjucks',
					portfolio: 'portfolio-entry.nunjucks'
				}))
				.use(branch(use_markdown)
					.use(markdown())
				)
				.use(branch(dont_use_markdown)
					.use(rename_markdown())
				)
				.use(copy({
					pattern: 'standalone/**/*',
					transform: (path) => path.replace('standalone\\', '')
				}))
				.use(ignore('standalone/**/*'))
				.use(permalinks({
					pattern: ':title',
					relative: false,
					linksets: [
						{
							match: { collection: 'portfolio' },
							pattern: ':collection/:title'
						}
					],
				}))
				.use(root())
				.use(layouts({
					engine: 'nunjucks',
					requires: {
						'nunjucks': nunjucks,
					},
					default: 'page.nunjucks',
					pattern: '**/*.html'
				}))
				.use(alias())
				.use(branch(use_markdown)
					.use(htmlMinifier({
						collapseWhitespace: build,
						minifyJS: function(text, inline) {
							var babel = require('babel-core');
							return babel.transform(text, babel_options).code;
						}
					}))
				)
		)
		.pipe(gulp.dest("./build"));
	return runSequence('cache-bust');
});

gulp.task('sass', function () {
	gulp.src('./sass/**/*.scss')
		.pipe(sass({
			outputStyle: build ? 'compressed' : 'expanded'
		}))
		.pipe(autoprefixer(
			{
				browsers: [
					'> 1%',
					'last 4 versions',
					'firefox >= 4',
					'safari 7',
					'safari 8',
					'IE 8',
					'IE 9',
					'IE 10',
					'IE 11'
				],
				cascade: false
			}
		))
		.pipe(rev_pipe())
		.pipe(gulp.dest('./build/css'))
		.pipe(rev.manifest("rev-css-manifest.json"))
		.pipe(through.obj(function(file, enc, cb) {
			var json = JSON.parse(file.contents.toString());
			json = _.mapKeys(json, function(value, key) {
				return "css/" + key;
			});
			json = _.mapValues(json, function(value, key) {
				return "css/" + value;
			});
			var buffer = new Buffer(JSON.stringify(json));
			file.contents = buffer;
			cb(null, file);
		}))
		.pipe(revD({
			oldManifest: './between/rev-css-manifest.json',
			dest: './build'
		}))
		.pipe(gulp.dest('./between'));
	return runSequence('metalsmith');
});

gulp.task('images', function() {
	return es.merge(
		gulp.src('./between/generated-images/**/*'),
		gulp.src(['./images/**/*', "!./images/portfolio{,/**/*}"]))
	.pipe(gulp.dest('./build/images'));
});

gulp.task('resize-images', function() {
	var size = 800;
	var size_large = {
		width: 1920,
		height: 1080
	};
	var quality = 75;
	var high_quality = 90;
	return gulp.src('./images/portfolio/**/*')
		.pipe(responsive({
			'**/*': [
				{
					width: size,
					height: size,
					quality: quality,
					withoutEnlargement: false,
					rename:
					{
						suffix: '-square',
						extname: '.jpg'
					}
				},
				{
					width: size,
					height: size,
					quality: quality,
					withoutEnlargement: false,
					rename:
					{
						suffix: '-square',
						extname: '.webp'
					}
				},
				{
					width: size_large.width,
					height: size_large.height,
					min: true,
					quality : high_quality,
					rename:
					{
						extname: '.jpg'
					}
				},
				{
					width: size_large.width,
					height: size_large.height,
					min: true,
					quality: high_quality,
					rename:
					{
						extname: '.webp'
					}
				}
			]
		},
		{
			progressive: true,
			crop: 'centre',
			stats: false,
			silent: true,
			errorOnUnusedImage: false,
			errorOnEnlargement: false,
			withoutEnlargement: true
		}))
		.pipe(gulp.dest('./between/generated-images/portfolio'));
});

gulp.task('assets', function() {
	var rev_filter = filter(function(file) {
		// version webapp manifest file
		return (file.path.lastIndexOf('manifest') > -1);
	}, { restore: true });

	gulp.src('./assets/**/*')
		.pipe(rev_filter)
		.pipe(rev_pipe())
		.pipe(rev_filter.restore)
		.pipe(gulp.dest('./build'))
		.pipe(rev.manifest("rev-assets-manifest.json"))
		.pipe(revD({
			oldManifest: './between/rev-assets-manifest.json',
			dest: './build'
		}))
		.pipe(gulp.dest('./between'));
	return runSequence('metalsmith');
});

gulp.task('javascript', function() {
	var rev_filter = filter(function(file) {
		// don't version service-worker
		return !(file.path.lastIndexOf('service-worker') > -1);
	}, { restore: true });

	gulp.src(['./javascript/**/*.js', '!**/_*.js'])
		.pipe(template({
			now: now,
			build: build
		},
		{
			interpolate: /<%=([\s\S]+?)%>/g
		}))
		.pipe(include())
		.pipe(babel(babel_options))
		.pipe(rev_filter)
		.pipe(rev_pipe())
		.pipe(rev_filter.restore)
		.pipe(gulp.dest('./build'))
		.pipe(rev.manifest("rev-js-manifest.json"))
		.pipe(revD({
			oldManifest: './between/rev-js-manifest.json',
			dest: './build'
		}))
		.pipe(gulp.dest('./between'));
	return runSequence('metalsmith');
});

gulp.task('cache-bust', function() {
	manifest = gulp.src('./between/rev-*.json');
	if (build)
	{
		gulp.src('./build/**/*.{html,css,js,json}', { base: './' })
			.pipe(build ? revR({
				manifest: manifest
			}) : gutil.noop())
			.pipe(gulp.dest('./'));
	}
	return runSequence('livereload');
});

gulp.task('clean', function() {
	return es.merge(
		gulp.src('./build', { read: false }),
		gulp.src('./between/*.json', { read: false })
	)
	.pipe(clean());
});