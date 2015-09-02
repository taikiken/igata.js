/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/20 - 21:46
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
var setting = require( './setting.js' );

// ----------------------------------------------------------------
//  dir
// ----------------------------------------------------------------
var dir = setting.dir;

// ----------------------------------------------------------------
//  gulp & main plugins
// ----------------------------------------------------------------
var gulp = setting.gulp;
var plugin = setting.plugin;

var $ = plugin.$;
var del = plugin.del;
var runSequence = plugin.runSequence;

// ----------------------------------------------------------------
// server
// ----------------------------------------------------------------
//var browserSync = plugin.browserSync;
//var pageSpeed = plugin.pageSpeed;
//var reload = plugin.reload;
var port = setting.port;

// ----------------------------------------------------------------
//  external tasks
// ----------------------------------------------------------------
try { require('require-dir')('tasks'); } catch (err) { console.error(err); }

// ----------------------------------------------------------------
//  main tasks
// ----------------------------------------------------------------

//gulp.task( 'serve', function () {
//
//  $.shell.task(
//    [
//      'http-server ../ -a 192.168.1.199 -p ' + port
//    ]
//  );
//
//} );