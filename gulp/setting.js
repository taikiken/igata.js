/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/03/24 - 12:06
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
//  project port
// ----------------------------------------------------------------
var port = 79000;

// ----------------------------------------------------------------
//  project directory list
// ----------------------------------------------------------------

var src = '../src';
var lib = '../lib';
var docs = '../docs';
var example = '../examples';

// ----------------------------------------------------------------
// package.json
var pkg = require( './package.json' );

// ----------------------------------------------------------------
// rewrite patterns
var patterns = [
  {
    match: 'buildTime',
    replacement: new Date().toLocaleString()
  },
  {
    match: 'year',
    replacement: new Date().getFullYear()
  },
  {
    match: 'version',
    replacement: pkg.version
  },
  {
    match: 'gitUrl',
    replacement: pkg.repository.url
  }
];

// ----------------------------------------------------------------
//  gulp plugin
// ----------------------------------------------------------------
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pageSpeed = require('psi');
var reload = browserSync.reload;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// ----------------------------------------------------------------
//  exports
module.exports = {
  dir: {
    src: src,
    lib: lib,
    docs: docs,
    example: example
  },
  version: pkg.version,
  git: pkg.repository.url,
  patterns: patterns,
  port: port,
  gulp: gulp,
  plugin: {
    $: $,
    del: del,
    runSequence: runSequence,
    browserSync: browserSync,
    pageSpeed: pageSpeed,
    reload: reload
  },
  AUTOPREFIXER_BROWSERS: AUTOPREFIXER_BROWSERS
};