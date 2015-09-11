///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/11 - 15:19
// *
// * Copyright (c) 2011-2015 inazumatv.com, inc.
// *
// * Distributed under the terms of the MIT license.
// * http://www.opensource.org/licenses/mit-license.html
// *
// * This notice shall be included in all copies or substantial portions of the Software.
// *
// * for igata.js
// */
/*jslint -W016*/
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  global.Cascade = ( function () {

    /**
     * cascade files parent Class.
     *
     *
     * @class Cascade
     * @static
     * @constructor
     */
    function Cascade () {
      throw new Error( 'Cascade can\'t create instance.' );
    }

    var p = Cascade.prototype;
    p.constructor = Cascade;

    return Cascade;

  }() );

}( window ) );