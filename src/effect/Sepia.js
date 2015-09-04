///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/04 - 18:27
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
/*jslint -W016*/

( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Sepia = ( function () {

    var Filter = Igata.Filter;

    /**
     * filter: sepia
     * @class Sepia
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Sepia ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Sepia );

    var p = Sepia.prototype;
    p.constructor = Sepia;

    /**
     * sepia filter を実行
     * @method filter
     */
    p.filter = function () {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data,
        i, limit,
        i1, i2,
        r, g, b;

      data = imageData.data;

      // http://www.qoncious.com/questions/how-apply-sepia-tone-image-html5-canvas
      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        i1 = i + 1;
        i2 = i + 2;
        r = data[ i ];
        g = data[ i1 ];
        b = data[ i2 ];
        //
        data[ i ]  = (r*0.393) + (g*0.769) + (b*0.189);// r
        data[ i1 ] = (r*0.349) + (g*0.686) + (b*0.168);// g
        data[ i2 ] = (r*0.272) + (g*0.534) + (b*0.131);// b
        //data[ i + 3 ] = data[ i + 3 ];// a

        //data[ i ]  = data[ i ]  * 0.9;
        //data[ i1 ] = data[ i1 ] * 0.7;
        //data[ i2 ] = data[ i2 ] * 0.4;

      }

      ctx.putImageData( imageData, 0, 0 );

    };

    return Sepia;

  }() );

}( window ) );