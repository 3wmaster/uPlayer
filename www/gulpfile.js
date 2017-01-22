var gulp = require('gulp'),
	concat = require('gulp-concat'),
	imagemin = require('gulp-imagemin'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	minifyCSS = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	newer = require('gulp-newer'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload,
	browserify = require('browserify'),
	babelify = require("babelify"),
	transform = require('vinyl-transform'),
	through2 = require("through2"),

    //
	srcJS = '_src/js/*.js',
	srcCSS = '_src/less/*.less',
    srcIMG =  ['_src/img/**/*.*', '_src/img/**/**/*.*'],

	//
	destJS = 'static/js/vendors',
	destCSS = 'static/css',
	destIMG = 'static/img',
	proxy = 'http://v4.kinoafisha',
	taskJS = function() {
		gulp.src(srcJS)
			.pipe(newer(destJS))
			.pipe(through2.obj(function (file, enc, next){
				browserify(file.path)
					.transform(babelify.configure({
						loose: ["es6.modules", "es6.classes"]
					}))
					.bundle(function(err, res){
						// assumes file.contents is a Buffer
						file.contents = res;
						next(null, file);					
					});
			}))
			.pipe(gulp.dest(destJS))
			.pipe(reload({stream: true}));
	},
	taskCSS = function() {
		var names = {};	
		gulp.src(srcCSS)
			.pipe(newer(destCSS + '/uPlayer.css'))
			.pipe(rename(function (path){
				if(names[path.basename]) throw new Error(console.log('CAUTION! CSS File name duplication. Check the class names'));
				names[path.basename] = true;
			}))
			.pipe(concat('uPlayer.less'))
			.pipe(less())
			.pipe(autoprefixer({cascade:false}))		
			.pipe(minifyCSS())
			.pipe(gulp.dest(destCSS))
			.pipe(reload({stream: true}));
	},
	taskIMG = function() {
		gulp.src(srcIMG)
			.pipe(newer(destIMG))
			.pipe(imagemin({
				svgoPlugins: [
					{removeViewBox: false}, 
					{removeHiddenElems: false}, 
					{removeXMLProcInst:false}, 
					{removeUnknownsAndDefaults:false}, 
					{removeMetadata:false},
					{removeUselessDefs:false},
					{cleanupIDs:false}
				]
			}))
			.pipe(gulp.dest(destIMG))
			.pipe(reload({stream: true}));
	};


//

gulp.task('default',  function() {
	taskCSS();
	taskJS();
	taskIMG();

    browserSync.init({proxy:proxy});

    gulp.watch(srcCSS, function(){
        taskCSS();
    });
    gulp.watch(srcJS, function(){
        taskJS();
    });
    gulp.watch(srcIMG, function(){
        taskIMG();
    });

});


















