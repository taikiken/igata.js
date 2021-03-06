/*!
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/04/20 - 16:51
 *
 * Copyright (c) 2011-@@year inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * thanks
 * gl-matrix
 * https://github.com/toji/gl-matrix
 *
 * html5rocks.com
 * http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
 *
 * Blur by Mario Klingemann
 * http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
 *
 * version @@version
 * build @@buildTime
 * git @@gitUrl
 *
 */
/*jslint -W016*/
/**
 * HTML 5 Canvas image effects.
 *
 * brightness, invert, grayscale, threshold, blur, convolution...
 *
 * @module Igata
 * @type {Igata}
 */
var Igata = window.Igata || {};

( function ( window, Igata ){
  "use strict";

  var
    global = Igata;

  // alias methods
  global.Float32Array = window.Float32Array;

  global._random = Math.random;

  global._abs = Math.abs;

  global._min = Math.min;

  global._max = Math.max;

  global._sqrt = Math.sqrt;

  global._cos = Math.cos;

  global._sin = Math.sin;

  global._round = Math.round;

  global._floor = Math.floor;

  global._exp = Math.exp;

  global._log = Math.log;

  global._pow = Math.pow;

  global._PI = Math.PI;

  global._2PI = Math.PI * 2;

  ///**
  // * @property EPSILON
  // * @for Igata
  // * @static
  // * @readonly
  // * @type {number}
  // * @default 0.000001
  // */
  //Igata.EPSILON = 0.000001;

  /**
   * @method extend
   * @for Igata
   * @static
   * @param {function} Parent
   * @param {function} Child
   */
  global.extend = function ( Parent, Child ) {

    Child.prototype = Object.create( Parent.prototype );
    Child.prototype.constructor = Child;

  };

  // CONSTANTS
  /**
   * @for Igata
   * @const EPSILON
   * @static
   * @type {number}
   * @default 0.0000001192092896
   */
  var EPSILON = 0.0000001192092896;
  /**
   * @for Igata
   * @const FLT_MIN
   * @static
   * @type {number}
   * @default 1E-37
   */
  var FLT_MIN = 1E-37;

  // implementation from CCV project
  // currently working only with u8,s32,f32
  var
    /**
     * @for Igata
     * @static
     * @const U8_t
     * @type {number}
     * @default 0x0100
     */
    U8_t = 0x0100,
    /**
     * @for Igata
     * @static
     * @const S32_t
     * @type {number}
     * @default 0x0200
     */
    S32_t = 0x0200,
    /**
     * @for Igata
     * @static
     * @const F32_t
     * @type {number}
     * @default 0x0400
     */
    F32_t = 0x0400,
    /**
     * @for Igata
     * @static
     * @const S64_t
     * @type {number}
     * @default 0x0800
     */
    S64_t = 0x0800,
    /**
     * @for Igata
     * @static
     * @const F64_t
     * @type {number}
     * @default 0x1000
     */
    F64_t = 0x1000;

  var
    /**
     * @for Igata
     * @static
     * @const C1_t
     * @type {number}
     * @default 0x01
     */
    C1_t = 0x01,
    /**
     * @for Igata
     * @static
     * @const C2_t
     * @type {number}
     * @default 0x02
     */
    C2_t = 0x02,
    /**
     * @for Igata
     * @static
     * @const C3_t
     * @type {number}
     * @default 0x03
     */
    C3_t = 0x03,
    /**
     * @for Igata
     * @static
     * @const C4_t
     * @type {number}
     * @default 0x04
     */
    C4_t = 0x04;
  /**
   * @for Igata
   * @static
   * @const _data_type_size
   * @type {Int32Array}
   * @default new Int32Array([ -1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8 ])
   * @private
   */
  var _data_type_size = new Int32Array([ -1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8 ]);

  /**
   * @for Igata
   * @method get_data_type
   * @static
   * @param {number} type
   * @returns {number}
   */
  function get_data_type ( type ) {

    return ( type & 0xFF00 );

  }

  /**
   * @for Igata
   * @method get_channel
   * @static
   * @param {number} type
   * @returns {number}
   */
  function get_channel ( type ) {

    return ( type & 0xFF );

  }

  /**
   * @for Igata
   * @method get_data_type_size
   * @static
   * @param {number} type
   * @returns {*}
   */
  function get_data_type_size ( type ) {

    return _data_type_size[ ( type & 0xFF00 ) >> 8 ];

  }

  // color conversion
  /**
   * @for Igata
   * @static
   * @const COLOR_RGBA2GRAY
   * @type {number}
   * @default 0
   */
  var COLOR_RGBA2GRAY = 0;
  /**
   * @for Igata
   * @static
   * @const COLOR_RGB2GRAY
   * @type {number}
   * @default 1
   */
  var COLOR_RGB2GRAY = 1;
  /**
   * @for Igata
   * @static
   * @const COLOR_BGRA2GRAY
   * @type {number}
   * @default 2
   */
  var COLOR_BGRA2GRAY = 2;
  /**
   * @for Igata
   * @static
   * @const COLOR_BGR2GRAY
   * @type {number}
   * @default 3
   */
  var COLOR_BGR2GRAY = 3;

  // box blur option
  /**
   * @for Igata
   * @static
   * @const BOX_BLUR_NOSCALE
   * @type {number}
   * @default 0x01
   */
  var BOX_BLUR_NOSCALE = 0x01;
  // svd options
  /**
   * @for Igata
   * @static
   * @const SVD_U_T
   * @type {number}
   * @default 0x01
   */
  var SVD_U_T = 0x01;
  /**
   * @for Igata
   * @static
   * @const SVD_V_T
   * @type {number}
   * @default 0x02
   */
  var SVD_V_T = 0x02;

  // copy to global
  // data types
  global.U8_t = U8_t;
  global.S32_t = S32_t;
  global.F32_t = F32_t;
  global.S64_t = S64_t;
  global.F64_t = F64_t;
  // data channels
  global.C1_t = C1_t;
  global.C2_t = C2_t;
  global.C3_t = C3_t;
  global.C4_t = C4_t;

  // popular formats
  global.U8C1_t = U8_t | C1_t;
  global.U8C3_t = U8_t | C3_t;
  global.U8C4_t = U8_t | C4_t;

  global.F32C1_t = F32_t | C1_t;
  global.F32C2_t = F32_t | C2_t;
  global.S32C1_t = S32_t | C1_t;
  global.S32C2_t = S32_t | C2_t;

  // constants
  global.EPSILON = EPSILON;
  global.FLT_MIN = FLT_MIN;

  // color convert
  global.COLOR_RGBA2GRAY = COLOR_RGBA2GRAY;
  global.COLOR_RGB2GRAY = COLOR_RGB2GRAY;
  global.COLOR_BGRA2GRAY = COLOR_BGRA2GRAY;
  global.COLOR_BGR2GRAY = COLOR_BGR2GRAY;

  // options
  global.BOX_BLUR_NOSCALE = BOX_BLUR_NOSCALE;
  global.SVD_U_T = SVD_U_T;
  global.SVD_V_T = SVD_V_T;

  global.get_data_type = get_data_type;
  global.get_channel = get_channel;
  global.get_data_type_size = get_data_type_size;

  ///**
  // * Cascade files
  // * @module Cascade
  // * @type {{}}
  // */
  //global.Cascade = {};

}( window, Igata ) );
