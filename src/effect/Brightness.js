/*jslint -W016*/
/**
 * @module Igata
 * @type {Brightness}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Brightness = ( function () {

    var Filter = Igata.Filter;

    /**
     * filter: brightness
     * @class Brightness
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Brightness ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Brightness );

    var p = Brightness.prototype;
    p.constructor = Brightness;

    /**
     * brightness filter を実行
     * @method filter
     * @param {number} value
     */
    p.filter = function ( value ) {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data,
        val,
        step,
        i, limit;

      data = new Uint8ClampedArray( bitmap.identity );

      //val = 255 / 100 * value;
      val = 2.55 * value;

      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        step = i;
        data[ step ] = val + data[ step ];// r
        step = i + 1;
        data[ step ] = val + data[ step ];// g
        step = i + 2;
        data[ step ] = val + data[ step ];// b

      }

      imageData.data.set( data );
      ctx.putImageData( imageData, 0, 0 );

    };

    return Brightness;

  }() );

}( window ) );