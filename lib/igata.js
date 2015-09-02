/**
 * license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * date 2015/04/20 - 16:51
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 *
 * thanks
 * gl-matrix
 * https://github.com/toji/gl-matrix
 *
 * version 0.0.1
 * build 2015-09-02 19:48:04
 * git https://github.com/taikiken/igata.js
 *
 */
/**
 * @module Igata
 * @type {Igata}
 */
var Igata = window.Igata || {};

( function ( window ){
  "use strict";

  var
    Igata = window.Igata;

  // alias methods
  Igata.Float32Array = window.Float32Array;

  Igata._random = Math.random;

  Igata._abs = Math.abs;

  Igata._min = Math.min;

  Igata._max = Math.max;

  Igata._sqrt = Math.sqrt;

  Igata._cos = Math.cos;

  Igata._sin = Math.sin;

  Igata._PI = Math.PI;

  /**
   * @property EPSILON
   * @for Igata
   * @static
   * @readonly
   * @type {number}
   * @default 0.000001
   */
  Igata.EPSILON = 0.000001;

  /**
   * @method extend
   * @for Igata
   * @static
   * @param {function} Parent
   * @param {function} Child
   */
  Igata.extend = function ( Parent, Child ) {

    Child.prototype = Object.create( Parent.prototype );
    Child.prototype.constructor = Child;

  };

}( window ) );

///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/02 - 16:30
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
     * context.imageData を取得します
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