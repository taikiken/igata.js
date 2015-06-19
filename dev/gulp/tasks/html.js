/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/21 - 14:35
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
// Scan your HTML for assets & optimize them
gulp.task('html-min', function () {
  var assets = $.useref.assets({searchPath: '{' + tmp + ',' + app + '}'});

  return gulp.src( app + '/**/*.html' )
    .pipe( $.plumber() )
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove any unused CSS
    // Note: if not using the Style Guide, you can delete it from
    //       the next line to only include styles your project uses.

    .pipe($.if('*.css', $.uncss({
      html: [
        'app/index.html',
        'app/styleguide.html'
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/
      ]
    })))

    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Update production Style Guide paths
    .pipe($.replace('components/components.css', 'components/main.min.css'))
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output files
    .pipe(gulp.dest(htdocs))
    .pipe($.size({title: '*** html-min ***'}));
});