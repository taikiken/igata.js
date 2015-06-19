/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 15/04/19
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
/*jslint node: true */
"use strict";

// setting
var setting = require( './setting.js' );

// gulp / gulp-load-plugins
var gulp = setting.gulp;
var $ = setting.$;

// module
var $$ = setting.module;

var del = $$.del;
var runSequence = $$.runSequence;

// directory
var dir = setting.dir;
var app = dir.app;
var tmp = dir.tmp;
var htdocs = dir.htdocs;

// css prefix
var AUTO_PREFIX_BROWSERS = setting.AUTO_PREFIX_BROWSERS;

// ------------------------------------------------------
// server
var browserSync = $$.browserSync;
var reload = $$.reload;
var pageSpeed = $$.pageSpeed;
var port = setting.port;

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) { console.error(err); }

// ------------------------------------------------------
// tasks
// ------------------------------------------------------

// Copy all files at the root level (app)
gulp.task('copy', function () {
  return gulp.src([
    app + '/*.{min.js,app.js,pack.js}',
    app + '/**/!(*.scss|*.html|*.jpg|*.png|*.gif|*.svg|*.map)'
  ], {
    dot: true
  }).pipe(gulp.dest( htdocs ))
    .pipe($.size({title: '*** copy ***'}));
});

// Clean output directory
gulp.task( 'clean',
  del.bind(null,
    [ htdocs + '/**/*.map'],
    {
      base: process.cwd(),
      dot:true,
      force: true
    }
  )
);

// Watch files for changes & reload
gulp.task('serve', ['css-dev'], function () {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'DEV',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: [ tmp, app ],
      directory: true
    },
    // additional option sever launch by ip address
    //host: ip,
    open: "external",
    port: port
  });

  gulp.watch([ app + '/**/*.html'], reload);
  gulp.watch([ app + '/**/*.{scss,css}'], ['css-dev', reload]);
  gulp.watch([ app + '/**/*.js'], ['js-hint', 'js-min']);
  gulp.watch([ app + '/**/*.{png,jpg,gif,svg}'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'BLD',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: htdocs,
    // additional option sever launch by ip address
    //host: ip,
    open: "external",
    port: port
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    'css-dev',
    [
      'js-hint',
      'js-min',
      'html-min',
      'image-min',
      'font-copy'
    ],
    'clean',
    cb
  );
});

// Run PageSpeed Insights
gulp.task('page-speed', function (cb) {
  // Update the below URL to the public URL of your site
  pageSpeed.output('example.com', {
    strategy: 'mobile'
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});