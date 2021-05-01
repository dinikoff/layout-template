const gulp = require('gulp');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const sass = require('gulp-sass');
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
	return gulp.src('./src/img/**/*')
				// size down, webp
				.pipe(gulp.dest('./build/img/'))
				.pipe(browserSync.stream());
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
}

let build = gulp.parallel(html, styles, images);
let buildWithClean = gulp.series(clean, build);
let dev = gulp.series(buildWithClean, watch);

gulp.task('build', buildWithClean);
gulp.task('watch', dev);