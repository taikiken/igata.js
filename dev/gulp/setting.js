/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 15/04/19
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 */
/*jslint node: true */
'use strict';

// ------------------------------------------------------
// package
var pkg = require( './package.json' );

// ------------------------------------------------------
// Node / Gulp module
// ------------------------------------------------------

// Include Gulp & tools we'll use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pageSpeed = require('psi');
var reload = browserSync.reload;

// ------------------------------------------------------
// Sass prefix 設定
var AUTO_PREFIX_BROWSERS = [
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
//  patterns
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
  }
];

// ------------------------------------------------------
// directory
// ------------------------------------------------------

var app = '../app';

//var scss = '../scss';

var example = '../example';

//var tmp = '../.tmp';

// js directory
var root = '../';
var src = root + '/src';
var docs = root + '/docs';
var libs = root + '/lib';
var dependencies = root + '/dependencies';

// ------------------------------------------------------
// server
// ------------------------------------------------------
var port = '39000';

// ------------------------------------------------------
// exports
// ------------------------------------------------------
module.exports = {
  dir: {
    app: app,
    example: example,
    //scss: scss,
    //tmp: tmp,

    js: js,
    src: src,
    libs: libs,
    dependencies: dependencies,
    docs: docs
  },
  gulp: gulp,
  $: $,
  module: {
    del: del,
    runSequence: runSequence,
    browserSync: browserSync,
    pageSpeed: pageSpeed,
    reload: reload
  },
  AUTO_PREFIX_BROWSERS: AUTO_PREFIX_BROWSERS,
  patterns: patterns,
  port: port
};