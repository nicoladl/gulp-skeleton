'use strict';
 
var gulp     = require('gulp'),
sass         = require('gulp-sass'),
autoprefixer = require('gulp-autoprefixer'),
uglify       = require('gulp-uglifyjs'),
gulpif       = require('gulp-if'),
concat       = require('gulp-concat'),
minifyCss    = require('gulp-clean-css'),
runSequence  = require('run-sequence'),
imagemin     = require('gulp-imagemin'),
pngquant     = require('imagemin-pngquant'),
w3cjs        = require('gulp-w3cjs'),
through2     = require('through2'),
browserSync  = require('browser-sync').create();

var prod = false;

var basepath = './src/',
webPath      = basepath + 'web',
bowerPath    = './bower_components';

var vendor = [
	bowerPath + '/jquery/dist/jquery.min.js'
]

// task - bower vendors
gulp.task('vendor', function(){

	return gulp.src(vendor)
	    .pipe(uglify({
            preserveComments: 'some'
        }))
	    .pipe(concat('plugins.js'))
	    .pipe(gulp.dest(webPath + '/js/vendor'))
});

// task - sass
gulp.task('sass', function () {

  return gulp.src(basepath + 'sass/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
	.pipe(autoprefixer({
		browsers: ['last 2 versions'],
		cascade: false
	}))
	.pipe(gulpif(prod, minifyCss({
		compatibility: 'ie8'}
	)))
    .pipe(gulp.dest(webPath + '/css'))
    .pipe(browserSync.stream());
});

// task - js
gulp.task('js',function(){

	return gulp.src(basepath + 'js/*.js')
	    .pipe(gulpif(prod, uglify({
            preserveComments: 'some'
        })))
	    .pipe(concat('script.js'))
		.pipe(gulp.dest(webPath + '/js'));
});

// task - image minificator
gulp.task('images', function() {

    return gulp.src(basepath + 'img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(webPath + '/img'));
});

// task - w3c controller
gulp.task('w3cjs', function () {
    return gulp.src(basepath + '*.html')
    .pipe(w3cjs())
    .pipe(through2.obj(function(file, enc, cb){
        cb(null, file);
        if (!file.w3cjs.success){
            // throw new Error('HTML validation error(s) found');
        }
    }));
});

// task - copy files
gulp.task('copy-files', function(){

	return gulp.src(['index.html', basepath + 'img/**/*', basepath + 'font/*'],{ 'base' : '.' })
		.pipe(gulp.dest(webPath));
});

// task - production task
gulp.task('prod',function(){
	prod = true;
	runSequence('vendor', 'sass', 'js', 'images', 'w3cjs', 'copy-files');
});

// task - watch task
gulp.task('watch', ['vendor', 'sass', 'js', 'images', 'w3cjs', 'copy-files'] ,function(){

	browserSync.init({
        server: webPath + '/'
    });

 	gulp.watch(basepath + 'sass/**/*.scss', ['sass']).on('change', browserSync.reload);
 	gulp.watch(basepath + 'js/*.js', ['js']).on('change', browserSync.reload);
 	gulp.watch(basepath + 'img/**/*', ['images']).on('change', browserSync.reload);
 	gulp.watch(basepath + '*.html', ['w3cjs', 'copy-files']).on('change', browserSync.reload);
 	
});

gulp.task('default', ['vendor', 'sass', 'js', 'images', 'w3cjs', 'copy-files']);