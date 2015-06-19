/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/21 - 14:26
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
// tasks
// ------------------------------------------------------
// Compile and automatically prefix stylesheets
gulp.task('css-dev', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    app + '/**/*.{scss,css}'
  ])
    .pipe( $.plumber() )
    .pipe($.sourcemaps.init())
    .pipe($.changed(app + '/**', {extension: '.css'}))
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: AUTO_PREFIX_BROWSERS}))
    .pipe(gulp.dest('.tmp'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.csso()))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest( htdocs ))
    .pipe($.size({title: '*** css-dev ***'}));
});