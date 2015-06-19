/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/21 - 14:51
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
var setting = require( '../setting.js' );

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

// replace task patterns
var patterns = setting.patterns;

// ------------------------------------------------------
// server
var browserSync = $$.browserSync;
var reload = $$.reload;

// ------------------------------------------------------
// tasks
// ------------------------------------------------------
// Lint JavaScript
gulp.task('js-hint', function () {
  return gulp.src( [
    app + '/**/*.js',
    '!' + app + '/**/*.{min.js,app.js,pack.js}'
  ] )
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// minify JavaScript
gulp.task('js-min', function () {
  return gulp.src( [
    app + '/**/*.js',
    '!' + app + '/**/*.{min.js,app.js,pack.js}'
  ] )
    .pipe( $.plumber() )
    .pipe( $.uglify( { preserveComments: 'some' } ) )
    .pipe( gulp.dest( htdocs ) )
    .pipe( $.size( { title: '*** js-min ***' } ) );
});