/**
 * license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
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
 * version @@version
 * build @@buildTime
 * git @@gitUrl
 *
 */
/**
 * @module Igata
 * @type {Igata}
 */
var Igata = window.Igata || {};

( function ( window ){
  "use strict";

  var
    Igata = window.Igata;

  // alias methods
  Igata.Float32Array = window.Float32Array;

  Igata._random = Math.random;

  Igata._abs = Math.abs;

  Igata._min = Math.min;

  Igata._max = Math.max;

  Igata._sqrt = Math.sqrt;

  Igata._cos = Math.cos;

  Igata._sin = Math.sin;

  Igata._PI = Math.PI;

  /**
   * @property EPSILON
   * @for Igata
   * @static
   * @readonly
   * @type {number}
   * @default 0.000001
   */
  Igata.EPSILON = 0.000001;

  /**
   * @method extend
   * @for Igata
   * @static
   * @param {function} Parent
   * @param {function} Child
   */
  Igata.extend = function ( Parent, Child ) {

    Child.prototype = Object.create( Parent.prototype );
    Child.prototype.constructor = Child;

  };

}( window ) );
