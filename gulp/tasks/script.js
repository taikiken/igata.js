/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/20 - 21:53
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
/*jslint node: true */
'use strict';

// ----------------------------------------------------------------
//  setting
// ----------------------------------------------------------------
var setting = require( '../setting.js' );

// ----------------------------------------------------------------
//  dir & pattern
// ----------------------------------------------------------------
var dir = setting.dir;
var patterns = setting.patterns;
var version = setting.version;

// ----------------------------------------------------------------
//  gulp & main plugins
// ----------------------------------------------------------------
var gulp = setting.gulp;
var plugin = setting.plugin;

var $ = plugin.$;
var del = plugin.del;
var runSequence = plugin.runSequence;

// ----------------------------------------------------------------
//  scripts
// ----------------------------------------------------------------
var libName = 'igata.js';
var scripts = [];

// ----------------------------------------------------------------
//  src
// ----------------------------------------------------------------
scripts.push( dir.src + '/igata.js' );

// geom
//scripts.push( dir.src + '/geom/IVector.js' );
//scripts.push( dir.src + '/geom/Vector2.js' );

// effect
scripts.push( dir.src + '/effect/Bitmap.js' );

scripts.push( dir.src + '/effect/Filter.js' );
scripts.push( dir.src + '/effect/Invert.js' );
scripts.push( dir.src + '/effect/Brightness.js' );
scripts.push( dir.src + '/effect/Grayscale.js' );
scripts.push( dir.src + '/effect/Sepia.js' );
scripts.push( dir.src + '/effect/Threshold.js' );
scripts.push( dir.src + '/effect/Blur.js' );
scripts.push( dir.src + '/effect/Convolution.js' );

// math
scripts.push( dir.src + '/math/Match.js' );
scripts.push( dir.src + '/math/Template.js' );

// feat
scripts.push( dir.src + '/feat/Structure.js' );
scripts.push( dir.src + '/feat/Cache.js' );

// feat/math
scripts.push( dir.src + '/feat/math/Calc.js' );
scripts.push( dir.src + '/feat/math/MatrixMath.js' );
scripts.push( dir.src + '/feat/math/LinearAlgebra.js' );

// feat effect
scripts.push( dir.src + '/feat/MotionModel.js' );
scripts.push( dir.src + '/feat/Processing.js' );

scripts.push( dir.src + '/feat/Orb.js' );


// ----------------------------------------------------------------
//  task
// ----------------------------------------------------------------

// concat
gulp.task( 'script-concat', function () {

  return gulp.src( scripts )
    .pipe( $.concat( libName ) )
    .pipe( $.replaceTask( { patterns: patterns } ) )
    .pipe( gulp.dest( dir.lib ) )
    .pipe( $.rename( function ( path ) {

      path.basename = path.basename + '-' + version;

    } ) )
    .pipe( gulp.dest( dir.lib ) )
    .pipe( $.size( { title: '*** script-concat ***' } ) );

} );

// minified
gulp.task( 'script-min', function () {

  return gulp.src( [

    dir.lib + '/' + libName,
    dir.lib + '/' + libName.replace( '.js', '-' + version + '.js' )

  ] )
    .pipe( $.uglify( { preserveComments: 'some' } ) )
    .pipe( $.rename( { suffix: '.min' } ) )
    .pipe( gulp.dest( dir.lib ) )
    .pipe( $.size( { title: '*** script-min ***' } ) );

} );

// docs
gulp.task( 'script-docs', function () {

  return gulp.src( scripts )
    .pipe( $.yuidoc() )
    .pipe( gulp.dest( dir.docs ) );

} );

// Lint JavaScript
gulp.task('script-hint', function () {
  return gulp.src( [
    dir.src + '/**/*.js'
  ] )
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

// ----------------------------------------------------------------
// run
// ----------------------------------------------------------------
// build without docs
gulp.task( 'script-dev', function () {

  runSequence(
    'script-hint',
    'script-concat',
    'script-min'
  );

} );

// build & docs
gulp.task( 'script-build', function () {

  runSequence(
    [
      'script-dev',
      'script-docs'
    ]
  );

} );