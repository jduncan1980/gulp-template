const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

const babel = require('gulp-babel');

const origin = 'src';
const destination = 'dist';

async function clean(cb) {
	await del(destination);
	cb();
}

function html(cb) {
	src(`${origin}/**/*.html`).pipe(dest(destination));
	cb();
}

function css(cb) {
	let plugins = [autoprefixer({ browsers: ['last 1 version'] }), cssnano()];

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

function js(cb) {
	src(`${origin}/js/lib/**/*.js`).pipe(dest(`${destination}/js/lib`));

	src(`${origin}/js/script.js`)
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(dest(`${destination}/js`));
	cb();
}

function watcher(cb) {
	watch(`${origin}/**/*.html`).on('change', series(html, browserSync.reload));
	watch(`${origin}/**/*.scss`).on('change', series(css, browserSync.reload));
	watch(`${origin}/**/*.js`).on('change', series(js, browserSync.reload));
	cb();
}

function server(cb) {
	browserSync.init({
		notify: false,
		open: false,
		server: {
			baseDir: destination,
		},
	});
	cb();
}

exports.default = series(clean, parallel(html, css, js), server, watcher);
