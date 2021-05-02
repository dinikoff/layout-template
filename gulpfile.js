const gulp = require('gulp');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const sass = require('gulp-sass');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const svgSprite = require('gulp-svg-sprite');
const imagemin = require('gulp-imagemin');
const pngquant =require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminJpegtran = require('imagemin-jpegtran');
const browserSync = require('browser-sync').create();

let isMap = process.argv.includes('--map');
let isImprove = process.argv.includes('--improve');

function clean(){
	return del('./build/*');
}

function html(){
	return gulp.src('./src/**/*.html')
				// silense
				.pipe(gulp.dest('./build'))
				.pipe(browserSync.stream());
}

function styles(){
	return gulp.src('./src/scss/main.scss')
				.pipe(gulpIf(isMap, sourcemaps.init()))
				.pipe(sass()).on('error', sass.logError)
				.pipe(gulpIf(isImprove, gcmq()))
				.pipe(gulpIf(isImprove, autoprefixer()))
				.pipe(gulpIf(isImprove, cleanCSS({
					level: 2
				})))
				.pipe(gulpIf(isMap, sourcemaps.write()))
				.pipe(gulp.dest('./build/css/'))
				.pipe(browserSync.stream());
}

function images(){
	return gulp.src('./src/img/**/*.{jpg,png}')
				// size down, webp
				.pipe(imagemin([
          imageminJpegtran({progressive: true}),
          imageminJpegRecompress({
            loops: 5,
            min: 65,
            max: 70,
            quality: 'medium'
          }),
          imagemin.optipng({optimizationLevel: 3}),
          pngquant({quality: [0.65, 0.7], speed: 5}),
        ]))
				.pipe(gulp.dest('./build/img/'))
				.pipe(browserSync.stream());
}

function svg(){
	return gulp.src('./src/img/**/*.svg')
					.pipe(svgmin({
						js2svg: {
							pretty: true
						}
					}))
					.pipe(cheerio({
						run: function ($) {
							$('[fill]').removeAttr('fill');
							$('[stroke]').removeAttr('stroke');
							$('[style]').removeAttr('style');
						},
						parserOptions: {xmlMode: true}
					}))
					.pipe(replace('&gt;', '>'))
        	// build svg sprite
					.pipe(svgSprite({
						mode: {
							symbol: {
								sprite: 'sprite.svg'
							}
						}
					}))
					.pipe(gulp.dest('./build/img/'));
}

function watch(){

browserSync.init({
	server: {
		baseDir: "./build/"
	}
});

	gulp.watch('./src/scss/**/*.scss', styles);
	gulp.watch('./src/**/*.html', html);
	gulp.watch('./src/img/**/*', images);
	gulp.watch('./src/img/**/*', svg);
}

let build = gulp.parallel(html, styles, images, svg);
let buildWithClean = gulp.series(clean, build);
let dev = gulp.series(buildWithClean, watch);

gulp.task('build', buildWithClean);
gulp.task('watch', dev);