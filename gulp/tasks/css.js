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
/*jslint -W079 */
"use strict";

// setting
var setting = require( '../setting.js' );

// gulp / gulp-load-plugins
var gulp = setting.gulp;

// module
var plugin = setting.plugin;

var $ = plugin.$;
var del = plugin.del;
var runSequence = plugin.runSequence;

// directory
var dir = setting.dir;
//var app = dir.app;
//var tmp = dir.tmp;
//var htdocs = dir.htdocs;

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
    dir.example + '/**/*.scss'
  ])
    .pipe( $.plumber() )
    .pipe( $.sourcemaps.init())
    //.pipe( $.changed( dir.example + '/**', {extension: '.css'}) )
    .pipe( $.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe( $.autoprefixer({browsers: AUTO_PREFIX_BROWSERS}))
    .pipe( gulp.dest(dir.example))
    // Concatenate and minify sty les
    //.pipe($.if('*.css', $.csso()))
    //.pipe($.sourcemaps.write())
    //.pipe(gulp.dest( htdocs ))
    .pipe($.size({title: '*** css-dev ***'}));
});