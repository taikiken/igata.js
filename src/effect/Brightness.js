///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/02 - 19:05
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
 * @type {Brightness}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Brightness = ( function () {

    var Filter = Igata.Filter;

    /**
     * filter: Brightness
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
     * Brightness filter を実行
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
        i, limit;

      data = new Uint8ClampedArray( bitmap.identity );

      //val = 255 / 100 * value;
      val = 2.55 * value;

      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        data[ i + 0 ] = val + data[ i + 0 ];// r
        data[ i + 1 ] = val + data[ i + 1 ];// g
        data[ i + 2 ] = val + data[ i + 2 ];// b

      }

      imageData.data.set( data );
      ctx.putImageData( imageData, 0, 0 );

    };

    return Brightness;

  }() );

}( window ) );