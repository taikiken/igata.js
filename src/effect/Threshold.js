/*jslint -W016*/
/**
 * @module Igata
 * @type {Grayscale}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Threshold = ( function () {

    var Filter = Igata.Filter;

    /**
     * filter: threshold
     * @class Threshold
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Threshold ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Threshold );

    var p = Threshold.prototype;
    p.constructor = Threshold;

    /**
     * 2値化 filter
     *
     * @method filter
     * @param {number=128} threshold 閾値
     */
    p.filter = function ( threshold ) {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data,
        i, limit,
        r, g, b,
        i1, i2,
        value;

      threshold = threshold || 128;
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
        value = r*0.2126 + g*0.7152 + b*0.0722 >= threshold ? 255: 0;
        data[ i ] = data[ i1 ] = data[ i2 ] = value;

      }

      ctx.putImageData( imageData, 0, 0 );

    };

    return Threshold;

  }() );

}( window ) );