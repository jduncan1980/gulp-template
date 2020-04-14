const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();

//CSS
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

//JS
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

//Images
const imagemin = require('gulp-imagemin');

const origin = 'src';
const destination = 'dist';

//Clean Dist Directory
async function clean(cb) {
	await del(destination);
	cb();
}

// Copy Html Files to Dist Directory
function html(cb) {
	src(`${origin}/**/*.html`).pipe(dest(destination));
	cb();
}

// Copy and compile style sheets
function css(cb) {
	let plugins = [autoprefixer(), cssnano()];

	// Vendor CSS and SCSS files
	src(`${origin}/styles/vendor/css/**/*.css`).pipe(
		dest(`${destination}/styles/vendor/css`)
	);

	src(`${origin}/styles/vendor/scss/**/*.scss`)
		.pipe(sass())
		.pipe(dest(`${destination}/styles/vendor/css`));

	// Project CSS and SCSS files
	src(`${origin}/styles/project/css/**/*.css`)
		.pipe(postcss(plugins))
		.pipe(dest(`${destination}/styles/project/css/`));

	src(`${origin}/styles/project/scss/**/*.scss`)
		.pipe(sass())
		.on('error', sass.logError)
		.pipe(postcss(plugins))
		.pipe(dest(`${destination}/styles/project/css/`));

	cb();
}

// Optimize And Copy Images

function image(cb) {
	src(`${origin}/images/**/*`)
		.pipe(imagemin())
		.pipe(dest(`${destination}/images`));
	cb();
}

// Compile, minify, and copy JS files
function js(cb) {
	src(`${origin}/js/vendor/**/*.js`).pipe(dest(`${destination}/js/vendor`));

	src(`${origin}/js/project/**/*.js`)
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(dest(`${destination}/js/project`));
	cb();
}

function watcher(cb) {
	watch(`${origin}/**/*.html`).on('change', series(html, browserSync.reload));
	watch(`${origin}/**/*.scss`).on('change', series(css, browserSync.reload));
	watch(`${origin}/**/*.css`).on('change', series(css, browserSync.reload));
	watch(`${origin}/**/*.js`).on('change', series(js, browserSync.reload));
	watch(`${origin}/images/**/*`).on('change', series(js, browserSync.reload));
	cb();
}

function server(cb) {
	browserSync.init({
		notify: false,
		open: true,
		server: {
			baseDir: destination,
		},
	});
	cb();
}

exports.default = series(
	clean,
	parallel(html, css, js, image),
	server,
	watcher
);
