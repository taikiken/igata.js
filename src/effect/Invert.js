///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/02 - 16:23
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
      //Object.defineProperties(
      //  this,
      //  {
      //    /**
      //     * @property bitmap
      //     * @type {Bitmap}
      //     */
      //    'bitmap': {
      //      get: function () {
      //
      //        return bitmap;
      //
      //      },
      //      set: function ( value ) {
      //
      //        bitmap = value;
      //
      //      }
      //    }
      //  }
      //);

      //this.bitmap = bitmap;

    }

    Igata.extend( Filter, Invert );

    var p = Invert.prototype;
    p.constructor = Invert;

    /**
     * Invert filter を実行
     * @method filter
     */
    p.filter = function () {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data,
        i, limit;

      data = imageData.data;
      //
      //if ( !bitmap.identity ) {
      //
      //  bitmap.save( imageData.data );
      //
      //}

      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        data[ i + 0 ] = 255 - data[ i + 0 ];// r
        data[ i + 1 ] = 255 - data[ i + 1 ];// g
        data[ i + 2 ] = 255 - data[ i + 2 ];// b
        //data[ i + 3 ] = data[ i + 3 ];// a

      }

      ctx.putImageData( imageData, 0, 0 );

    };

    ///**
    // * Invert filter を元に戻す
    // * @method restore
    // */
    //p.restore = function () {
    //
    //  var
    //    bitmap = this.bitmap,
    //    imageData = bitmap.get(),
    //    identity = bitmap.identity,
    //    ctx;
    //
    //  if ( !!identity ) {
    //
    //    imageData.data.set( identity );
    //    ctx = bitmap.context;
    //    ctx.putImageData( imageData, 0, 0 );
    //
    //  }
    //
    //};

    return Invert;

  }() );

}( window ) );