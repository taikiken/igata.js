/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/20 - 16:51
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
 * @version @@version
 * @build @@buildTime
 * @git @@gitUrl
 *
 * @module igata
 */

var igata = window.igata || {};

( function ( window ){
  "use strict";

  var
    igata = window.igata;

  // alias methods
  igata.Float32Array = window.Float32Array;

  igata._random = Math.random;

  igata._abs = Math.abs;

  igata._min = Math.min;

  igata._max = Math.max;

  igata._sqrt = Math.sqrt;

  igata._cos = Math.cos;

  igata._sin = Math.sin;

  igata._PI = Math.PI;

  /**
   * @property EPSILON
   * @for igata
   * @static
   * @readonly
   * @type {number}
   * @default 0.000001
   */
  igata.EPSILON = 0.000001;

  /**
   * @method extend
   * @for igata
   * @static
   * @param {function} Parent
   * @param {function} Child
   */
  igata.extend = function ( Parent, Child ) {

    Child.prototype = Object.create( Parent.prototype );
    Child.prototype.constructor = Child;

  };

}( window ) );
