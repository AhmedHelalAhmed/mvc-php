const gulp = require('gulp');
const { series } = require('gulp');

const puglint = require('gulp-pug-linter');
const sass = require('gulp-sass');
const sasslint = require('gulp-sass-lint');
const eslint = require('gulp-eslint');

const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browsersync = require('browser-sync').create();
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const imagesConvert = require('gulp-images-convert');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const path = require('path');

const webapckJsConfig = {
  mode: 'development',
  entry: {
    // Website JS Files
    'website/home.js': './resources/js/website/home.js',
    'website/contact.js': './resources/js/website/contact.js',
    'website/imprint.js': './resources/js/website/imprint.js',
    'website/privacy.js': './resources/js/website/privacy.js',
    'website/services.js': './resources/js/website/services.js',
    'website/404.js': './resources/js/website/404.js',

    // Admin JS Files
    'admin/home.js': './resources/js/admin/home.js',
    'admin/login.js': './resources/js/admin/login.js',
    'admin/profile.js': './resources/js/admin/profile.js',
    'admin/settings.js': './resources/js/admin/settings.js',
    'admin/users/user.js': './resources/js/admin/users/user.js',
    'admin/users/users.js': './resources/js/admin/users/users.js',
    'admin/users/new.js': './resources/js/admin/users/new.js',
    'admin/userGroups.js': './resources/js/admin/userGroups.js',
  },
  output: {
    path: path.resolve(__dirname, 'public/'),
    filename: '[name]',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};

// Folders 📁
const TEMPLATE_DIR = 'template';
const SASS_DIR = 'resources/sass';
const JAVASCRIPT_DIR = 'resources/js';
const IMGAGES_DIR = 'resources/imgs';
const FONTS_DIR = 'resources/sass/fonts';
const CSS_PUBLIC_DIR = 'public/css';
const JS_PUBLIC_DIR = 'public/js';
const IMG_PUBLIC_DIR = 'public/imgs';
const FONTS_PUBLIC_DIR = 'public/css/fonts';

// Files 🗄
const LIBS = {
  css: [
    {
      libs: [
        'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css',
      ],
    },
    {
      fonts: [
        'node_modules/font-awesome/fonts/**/*',
        'node_modules/simple-line-icons/fonts/**/*',
        'node_modules/@coreui/icons/fonts/**/*',
      ],
    },
    {
      webfonts: [
        'node_modules/@fortawesome/fontawesome-free/webfonts/**/*',
      ],
    },
    {
      flags: [
        'node_modules/flag-icon-css/flags/**/*',
      ],
    },
  ],
};

// Check Templates pug-lint Cehck ✅
function templatelint() {
  return gulp.src(`${TEMPLATE_DIR}/**/*.pug`)
    .pipe(puglint({ reporter: 'puglint-stylish' }));
}
exports.templatelint = templatelint;

// Check Style sass-lint Cehck ✅
function stylelint() {
  return gulp.src(`${SASS_DIR}/**/*.scss`)
    .pipe(sasslint({
      configFile: '.sass-lint.yml',
    }))
    .pipe(sasslint.format())
    .pipe(sasslint.failOnError());
}
exports.stylelint = stylelint;

// Check JavaScript eslint Cehck ✅
function scriptslint() {
  return gulp
    .src(`${JAVASCRIPT_DIR}/**/*.js`)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}
exports.scriptslint = scriptslint;

exports.lint = gulp.series(templatelint, stylelint, scriptslint);

// Style lint Cehck ✅ Convert 🔂 Compresse 🔄 Output ↪ 📁 public/css
async function styles() {
  return gulp
    .src([`${SASS_DIR}/**/*.scss`])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sass({ outputStyle: 'compressed' }))
    .on('error', sass.logError)
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${CSS_PUBLIC_DIR}`));
}
exports.styles = series(stylelint, styles);

// JavaScript lint Cehck ✅ Convert 🔂 Compresse 🔄 Output ↪ 📁 public/js
async function scripts() {
  return gulp
    .src(`${JAVASCRIPT_DIR}/**/*.js`)
    .pipe(webpackStream(webapckJsConfig), webpack)
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${JS_PUBLIC_DIR}`));
}
exports.scripts = series(scriptslint, scripts);

// Copy SVG Output ↪ 📁 public/imgs
async function imgmSvg() {
  return gulp
    .src(`${IMGAGES_DIR}/**/*.svg`)
    .pipe(gulp.dest(`${IMG_PUBLIC_DIR}`));
}
exports.imgmSvg = imgmSvg;

// Images Compress 🔄 Convert to .WEPB 🔂 Output ↪ 📁 public/imgs
async function imgmin() {
  return gulp
    .src(`${IMGAGES_DIR}/**/*.+(jpg|jpeg|png|webp)`)
    .pipe(imagemin())
    .pipe(imagesConvert({ targetType: 'webp' }))
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest(`${IMG_PUBLIC_DIR}`));
}
exports.imgmin = gulp.parallel(imgmin, imgmSvg);

// Fonts ↪ 📁 public/imgs
async function fonts() {
  return gulp
    .src(`${FONTS_DIR}/**/*.ttf`)
    .pipe(gulp.dest(`${FONTS_PUBLIC_DIR}`));
}
exports.fonts = fonts;

// Libraries Copy  ↪ 📁 node_modules/ Output ↪ 📁 public/ {js & css} /libs
async function libraries() {
  for (const LIB in LIBS) {
    for (const output of LIBS[LIB]) {
      if (typeof output === 'object') {
        for (const extra in output) {
          output[extra].map(outputExtra => gulp
            .src(`${outputExtra}`)
            .pipe(gulp.dest(`public/${LIB}/${extra}`)));
        }
      } else {
        return gulp
          .src(`${output}`)
          .pipe(gulp.dest(`public/${LIB}`));
      }
    }
  }
  return false;
}
exports.libraries = libraries;

// Start the Server 🖥
function server() {
  browsersync.init({
    proxy: 'localhost',
  });
}
exports.server = server;

// Check pug-lint Cehck ✅ Watch ⏳ // Output via PHP
function watchTemplate() {
  return gulp.watch(`${TEMPLATE_DIR}/**/*.pug`, templatelint);
}
exports.watchTemplate = watchTemplate;

// Check lint-sass Cehck ✅ Compress 🔄 Output ↪ public/css 📁 Watch ⏳
function watchStyles() {
  return gulp.watch(`${SASS_DIR}/**/*.scss`, series(stylelint, styles));
}
exports.watchStyles = watchStyles;

// Check lint-js Cehck ✅ Compress 🔄 Output ↪ public/js 📁 Watch ⏳
function watchScripts() {
  return gulp.watch(`${JAVASCRIPT_DIR}/**/*.js`, series(scriptslint, scripts));
}
exports.watchScripts = watchScripts;

// Run the main Plugins ▶
exports.watch = gulp.parallel(watchStyles, watchScripts, watchTemplate);

// Build the Plugins 🔥
gulp.task('build', gulp.series(templatelint, series(stylelint, styles), series(scriptslint, scripts), series(imgmin, imgmSvg, fonts, libraries)));
