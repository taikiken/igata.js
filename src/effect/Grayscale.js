/*jslint -W016*/
/**
 * @module Igata
 * @type {Grayscale}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Grayscale = ( function () {

    var Filter = Igata.Filter;

    /**
     * filter: grayscale
     *
     * @class Grayscale
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Grayscale ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Grayscale );

    var p = Grayscale.prototype;
    p.constructor = Grayscale;

    /**
     * grayscale filter を実行
     * @method filter
     */
    p.filter = function () {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data,
        i, limit,
        r, g, b,
        i1, i2,
        value;

      data = imageData.data;

      // http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        i1 = i + 1;
        i2 = i + 2;
        r = data[ i ];
        g = data[ i1 ];
        b = data[ i2 ];

        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        value = r*0.2126 + g*0.7152 + b*0.0722;
        data[ i ] = data[ i1 ] = data[ i2 ] = value;

      }

      ctx.putImageData( imageData, 0, 0 );

    };

    return Grayscale;

  }() );

}( window ) );