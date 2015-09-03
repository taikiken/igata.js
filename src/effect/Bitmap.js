/**
 * @module Igata
 * @type {Bitmap}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Bitmap = ( function () {

    /**
     * @class Bitmap
     * @param {CanvasRenderingContext2D} context
     * @param {Image} img
     * @constructor
     */
    function Bitmap ( context, img ) {

      var identity = null;//new Uint8ClampedArray( 0 );

      Object.defineProperties(
        this,
        {
          /**
           * @property context
           * @type {CanvasRenderingContext2D}
           * @readOnly
           */
          'context': {
            get: function () {

              return context;

            }
          },
          /**
           * @property img
           * @type {Image}
           * @readOnly
           */
          'img': {
            get: function () {

              return img;

            }
          },
          /**
           * @property identity
           * @type {Uint8ClampedArray}
           */
          'identity': {
            get: function () {

              return identity;

            },
            set: function ( value ) {

              identity = value;

            }
          }
        }
      );

    }

    var p = Bitmap.prototype;
    p.constructor = Bitmap;

    /**
     * CanvasRenderingContext2D.imageData を取得します
     * @method get
     * @param {number=0} [x]
     * @param {number=0} [y]
     * @param {number} [width]
     * @param {number} [height]
     * @return {ImageData}
     */
    p.get = function ( x, y, width, height ) {

      var
        context = this.context,
        img = this.img;

      if ( !!img ) {

        width = width || img.width;
        height = height || img.height;

      }

      x = x || 0;
      y = y || 0;

      return context.getImageData( x, y, width, height );

    };

    /**
     * 初期状態 imageData.data を保存します
     * @method save
     * @param {Uint8ClampedArray} data 初期状態の imageData.data
     */
    p.save = function ( data ) {

      this.identity = new Uint8ClampedArray( data );

    };

    return Bitmap;

  }() );

}( window ) );