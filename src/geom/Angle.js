///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/12
// *
// * Copyright (c) 2011-2015 inazumatv.com, inc.
// *
// * Distributed under the terms of the MIT license.
// * http://www.opensource.org/licenses/mit-license.html
// *
// * This notice shall be included in all copies or substantial portions of the Software.
// */
/**
 * ## 角度 helper
 *
 * degree, radian 相互変換
 *
 * @module Igata
 */
(function ( window ){

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  global.Angle = ( function (){

    var _PI = global._PI;
    var _2PI = global._2PI;

    /**
     * 角度計算 Helper
     *
     * @class Angle
     * @static
     * @constructor
     */
    function Angle () {
      throw new Error( 'Angle can\'t create instance.' );
    }

    var p = Angle.prototype;
    p.constructor = Angle;

    /**
     * radian を degree へ変換します
     * @method degree
     * @static
     * @param {number} radian
     * @return {number} 変換後 degree を返します
     */
    Angle.degree = function ( radian ) {

      return radian * ( 180.0 / _PI );

    };
    /**
     * 引数 degree （度数方）を radian （弧度法）に変換します
     * @method rad
     * @static
     * @param {number} degree 角度
     * @return {number} degree を radian へ変換し返します
     */
    Angle.rad = function ( degree ) {

      return ( _PI * degree ) / 180.0;

    };

    /**
     * radian を 0 ~ 2PI の間に正規化します
     * @method normalize
     * @static
     * @param {number} radian
     * @return {number} 引数 0 ~ 2PI へ変換し
     */
    Angle.normalize = function ( radian ) {

      // -2PI ~ 2PI
      var fmodf = radian % _2PI;
      if ( fmodf < 0 ) {

        // 0 ~ 2PI
        fmodf += _2PI;

      }

      return fmodf;

    };

    return Angle;

  }());

}( window ));