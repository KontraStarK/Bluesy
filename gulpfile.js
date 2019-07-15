'use strict';

//Сonnection of modules Gulp
const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const sizeFile = require('gulp-filesize');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const smartGrid = require('smart-grid');

// if Development - true, if Production - false
const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;


const path = {
   dest: './build'
}

//Paths
const cssFiles = [
   'src/less/main.less'

]
const jsFiles = [
   'src/libs/*.js',
   'src/js/main.js'

]

// HTML
gulp.task('html', () => {
   return gulp.src('./src/**/*.html')
      .pipe(sizeFile())
      .pipe(gulp.dest('./build'))
      .pipe(browserSync.stream());

});

// Style
gulp.task('styles', () => {
   return gulp.src(cssFiles)
      // .on('error', console.error.bind(console))
      .pipe(sourcemaps.init())
      .pipe(less())
      // .pipe(sass().on('error', sass.logError))
      // .pipe(concat('all.css'))
      .pipe(gcmq())
      .pipe(sizeFile())
      .pipe(gulpIf(isProd, autoprefixer({
         browsers: ['> 0.1%'],
         cascade: false
      })))
      .pipe(gulpIf(isProd, cleanCSS({
         level: 2
      })))
      .pipe(gulpIf(isDev, sourcemaps.write('./')))
      .pipe(gulp.dest(path.dest + '/css'))
      .pipe(sizeFile())
      .pipe(browserSync.stream());

});
//Smart-grid
gulp.task('grid', (done) => {
   delete require.cache[require.resolve('./smartgrid.js')];

	let settings = require('./smartgrid.js');
   smartGrid('./src/less', settings);
   smartGrid('./src/less', settings);
	done();
});


// JS
gulp.task('scripts', () => {
   return gulp.src(jsFiles)
      .pipe(concat('all.js'))
      .pipe(uglify({
         toplevel: true
      }))
      .pipe(sizeFile())
      .pipe(gulp.dest(path.dest + '/js'))
      .pipe(sizeFile())
      .pipe(browserSync.stream());
});
// IMG
gulp.task('images', () => {
   return gulp.src('./src/img/**/*')
      .pipe(sizeFile())
      .pipe(gulpIf(isProd, imagemin([
         pngquant({
            quality: [0.5, 0.5]
         }),
         mozjpeg({
            quality: 50
         })
      ])))
      .pipe(gulp.dest(path.dest + '/img'))
      .pipe(sizeFile())
      .pipe(browserSync.stream());
});
// Fonts
gulp.task('fonts', () => {
   return gulp.src('./src/fonts/**/*')
      .pipe(gulp.dest(path.dest + '/fonts'))
      .pipe(browserSync.stream());
});


// Сleaning the folder Build
gulp.task('clean', () =>{
   return gulp.src('build', {
         read: false
      })
      .pipe(clean());
});

//Track changes to files
gulp.task('watch', () => {
   browserSync.init({
      server: {
         baseDir: "./build/",
         index: "index.html"
      }
   });
   gulp.watch('./src/**/*.html', gulp.series('html'))
   gulp.watch('./src/less/**/*.less', gulp.series('styles'))
   gulp.watch('./src/js/**/*.js', gulp.series('scripts'))
   gulp.watch('./src/img/**/*', gulp.series('images'))
   gulp.watch('./src/fonts/**/*', gulp.series('fonts'))
   gulp.watch('./build/**/*.html').on('change', browserSync.reload);
   gulp.watch('./build/**/*.css').on('change', browserSync.reload);

});


gulp.task('build', gulp.series('clean', gulp.parallel('html', 'styles', 'scripts', 'images', 'fonts')));
gulp.task('default', gulp.series('build', 'watch'));

//To start, type the command "npm run dev" or "npm run build"