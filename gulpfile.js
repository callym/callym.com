var gulp = require('gulp'),
	gulp_front_matter = require('gulp-front-matter'),
	assign = require('lodash').assign,
	clean = require('gulp-clean'),
	connect = require('gulp-connect'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	runSequence = require('run-sequence');

var gulpsmith = require('gulpsmith'),
	markdown = require('metalsmith-markdown'),
	layouts = require('metalsmith-layouts'),
	permalinks = require('metalsmith-permalinks'),
	collections = require('metalsmith-collections'),
	root = require('metalsmith-rootpath'),
	nunjucks = require('nunjucks');

nunjucks.configure('', {
	watch: true,
	noCache: true,
});
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

gulp.task('default', function (cb) {
	runSequence('clean', ['metalsmith', 'sass', 'images'], cb);
});

gulp.task('watch', ['connect', 'default'], function() {
	gulp.watch(['./src/**/*', './layouts/**/*'], ['metalsmith']);
	gulp.watch('./sass/**/*', ['sass']);
	gulp.watch('./images/**/*', ['images']);
	gulp.watch('./build/**/*', ['livereload']);
});

gulp.task('connect', function() {
	connect.server({
		root: './build',
		livereload: true
	});
});

gulp.task('livereload', function() {
	gulp.src("./build/**/*")
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
});

gulp.task('sass', function () {
	return gulp.src('./sass/*.scss')
		.pipe(sass())
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
		.pipe(gulp.dest('./build/css'));
});

gulp.task('images', function() {
	return gulp.src('./images/**/*')
		.pipe(gulp.dest('./build/images'));
});

gulp.task('clean', function() {
	return gulp.src('./build', {read: false})
		.pipe(clean());
});