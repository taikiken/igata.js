/*jslint -W016*/
/**
 * @module Igata
 * @type {Invert}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Invert = ( function () {

    var Filter = Igata.Filter;

    /**
     * filter: 画像反転(Invert)
     * @class Invert
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Invert ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Invert );

    var p = Invert.prototype;
    p.constructor = Invert;

    /**
     * invert filter を実行
     * @method filter
     */
    p.filter = function () {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data,
        i, limit,
        step;

      data = imageData.data;

      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        step = i;
        data[ step ] = 255 - data[ step ];// r
        step = i + 1;
        data[ step ] = 255 - data[ step ];// g
        step = i + 2;
        data[ step ] = 255 - data[ step ];// b
        //data[ i + 3 ] = data[ i + 3 ];// a

      }

      ctx.putImageData( imageData, 0, 0 );

    };

    return Invert;

  }() );

}( window ) );