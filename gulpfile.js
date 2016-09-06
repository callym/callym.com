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

gulp.task('build', function(cb) {
	// this function should be used when
	// ready to deploy!
	// should do things like compress
	// minify
	// etc
	build = true;
	rev_pipe = rev_pipe.pipe(rev);
	return runSequence(
		'default',
		cb);
});

gulp.task('watch', ['connect', 'default'], function() {
	gulp.watch(['src/**/*', './layouts/**/*'], ['metalsmith']);
	gulp.watch('sass/**/*', ['sass']);
	gulp.watch('images/**/*', ['images']);
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
	gulp.src("./src/**/*")
		.pipe(gulp_front_matter()).on("data", function(file) {
			assign(file, file.frontMatter);
			delete file.frontMatter;
		}).pipe(
			gulpsmith()
				.use(collections({
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
					page: 'page.nunjucks',
					portfolio: 'portfolio-entry.nunjucks'
				}))
				.use(markdown())
				.use(permalinks({
					pattern: ':title',
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
				}))
		).pipe(gulp.dest("./build"));
	return runSequence('cache-bust');
});

gulp.task('sass', function () {
	gulp.src('./sass/*.scss')
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

gulp.task('images', ['resize-images'], function() {
	return es.merge(
		gulp.src('./between/generated-images/**/*'),
		gulp.src(['./images/**/*', "!./images/portfolio{,/**/*}"]))
	.pipe(gulp.dest('./build/images'));
});

gulp.task('resize-images', function() {
	var size = 800;
	var quality = 60;
	return gulp.src('./images/portfolio/**/*')
		.pipe(responsive({
			'**/*': [
				{
					width: size,
					height: size,
					quality: quality,
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
					rename:
					{
						suffix: '-square',
						extname: '.webp'
					}
				},
				{
					width: 2560,
					height: 1440,
					min: true,
					rename:
					{
						extname: '.jpg'
					}
				},
				{
					width: 2560,
					height: 1440,
					min: true,
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
		}))
		.pipe(include())
		.pipe(babel({
			presets: build ? ['babili'] : [],
			comments: build ? false : true,
			compact: build ? true : false
		}))
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

	gulp.src('./build/**/*.{html,css,js,json}', { base: './' })
		.pipe(build ? revR({
			manifest: manifest
		}) : gutil.noop())
		.pipe(gulp.dest('./'));
	return runSequence('livereload');
});

gulp.task('clean', function() {
	return es.merge(
		gulp.src('./build', { read: false }),
		gulp.src('./between/*.json', { read: false })
	)
	.pipe(clean());
});