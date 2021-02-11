const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

sass.compiler = require('node-sass');
 
// css
gulp.task('scss', function() {
	return gulp.src('./app/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(concat('style.min.css'))
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./build/css'));
});
 
gulp.task('scss:watch', function() {
  	gulp.watch('./app/**/*.scss', gulp.parallel('scss'));
});

gulp.task('vendor-css', function(){
    return gulp.src([
        './app/assets/css/*',
    ])
    .pipe(concat('vendor.min.css'))
	.pipe(gulp.dest('./build/css'));
});

// html
gulp.task('html', function() {
	return gulp.src(['./app/*.html'])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest('./build'));
});

gulp.task('html:watch', function() {
	gulp.watch('./app/**/*.html', gulp.parallel('html'));
});

// fonts
gulp.task('fonts', function() {
	return gulp.src('./app/assets/fonts/*')
		.pipe(gulp.dest('./build/fonts'));
});

// images
gulp.task('images', function() {
	return gulp.src(['./app/**/*.jpg', './app/**/*.png', './app/**/*.svg'])
		// .pipe(imagemin([
		// 	imagemin.gifsicle({interlaced: true}),
		// 	imagemin.mozjpeg({quality: 100, progressive: true}),
		// 	imagemin.optipng({optimizationLevel: 5}),
		// 	imagemin.svgo({
		// 		plugins: [
		// 			{removeViewBox: true},
		// 			{cleanupIDs: false}
		// 		]
		// 	})
		// ]))
		.pipe(rename({dirname: ''}))
		.pipe(gulp.dest('./build/images'));
});

gulp.task('images:watch', function() {
	gulp.watch(['./app/**/*.jpg', './app/**/*.png', './app/**/*.svg'], gulp.parallel('images'));
});

// js
gulp.task('js', function() {
	return gulp.src('./app/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({
            presets: ['@babel/env']
        }))
		// .pipe(uglify())
		.pipe(concat('script.min.js'))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('./build/js'));
});
 
gulp.task('js:watch', function() {
  	gulp.watch('./app/**/*.js', gulp.parallel('js'));
});

gulp.task('vendor-js', function(){
    return gulp.src([
		'node_modules/jquery/dist/jquery.min.js',
    ])
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('./build/js'));
});

// browser-sync
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
	});

	gulp.watch('./build').on('change', browserSync.reload);
});

// global
gulp.task('build', gulp.series('html', 'scss', 'images', 'fonts', 'vendor-css', 'js', 'vendor-js'));

gulp.task('dev', gulp.parallel('scss:watch', 'js:watch', 'html:watch', 'images:watch', 'browser-sync'));