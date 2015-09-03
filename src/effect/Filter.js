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
     * @return {ImageData} CanvasRenderingContext2D.imageData を返します
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