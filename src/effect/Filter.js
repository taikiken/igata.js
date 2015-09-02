///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/02 - 19:06
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
/**
 * @module Igata
 * @type {Filter}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Filter = ( function () {

    /**
     * @class Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Filter ( bitmap ) {

      Object.defineProperties(
        this,
        {
          /**
           * @property bitmap
           * @type {Bitmap}
           */
          'bitmap': {
            get: function () {

              return bitmap;

            },
            set: function ( value ) {

              bitmap = value;

            }
          }
        }
      );

    }

    var p = Filter.prototype;
    p.constructor = Filter;

    /**
     * filter を実行
     *
     * 継承子 Class で実装します
     *
     * @method filter
     */
    p.filter = function () {
    };

    /**
     * @method imageData
     * @param {Bitmap} bitmap
     * @return {*} CanvasRenderingContext2D.imageData を返します
     */
    p.imageData = function ( bitmap ) {

      var
        imageData = bitmap.get();

      if ( !bitmap.identity ) {

        bitmap.save( imageData.data );

      }

      return imageData;

    };


    /**
     * filter 前の状態に戻す
     * @method restore
     */
    p.restore = function () {

      var
        bitmap = this.bitmap,
        imageData = bitmap.get(),
        identity = bitmap.identity,
        ctx;

      if ( !!identity ) {

        imageData.data.set( identity );
        ctx = bitmap.context;
        ctx.putImageData( imageData, 0, 0 );

      }

    };

    return Filter;

  }() );

}( window ) );