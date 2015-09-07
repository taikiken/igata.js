/*!
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
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
 * html5rocks.com
 * http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
 *
 * Blur by Mario Klingemann
 * http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
 *
 * version 0.0.1
 * build 2015-09-07 17:58:00
 * git https://github.com/taikiken/igata.js
 *
 */
/**
 * HTML 5 Canvas image effects.
 *
 * brightness, invert, grayscale, threshold, blur, convolution...
 *
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

  Igata._round = Math.round;

  Igata._floor = Math.floor;

  Igata._exp = Math.exp;

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

      //var identity = null;//new Uint8ClampedArray( 0 );
      /**
       * @property identity
       * @type {Uint8ClampedArray|null}
       */
      this.identity = null;

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
          }
          //,
          ///**
          // * @property identity
          // * @type {Uint8ClampedArray}
          // */
          //'identity': {
          //  get: function () {
          //
          //    return identity;
          //
          //  },
          //  set: function ( value ) {
          //
          //    identity = value;
          //
          //  }
          //}
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
     * filter: 画像反転(invert)
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

      //data = imageData.data;
      //
      //// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
      //for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {
      //
      //  i1 = i + 1;
      //  i2 = i + 2;
      //  r = data[ i ];
      //  g = data[ i1 ];
      //  b = data[ i2 ];
      //
      //  // CIE luminance for the RGB
      //  // The human eye is bad at seeing red and blue, so we de-emphasize them.
      //  value = r*0.2126 + g*0.7152 + b*0.0722;
      //  data[ i ] = data[ i1 ] = data[ i2 ] = value;
      //
      //}
      Grayscale.to( imageData.data );

      ctx.putImageData( imageData, 0, 0 );

    };

    /**
     * ImageData.data を grayscale します
     *
     * @method to
     * @static
     * @param {CanvasPixelArray} data ImageData.data 形式(Uint8ClampedArray)
     */
    Grayscale.to = function ( data ) {

      var
        i, limit,
        i1, i2,
        r, g, b;

      // http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
      for ( i = 0, limit = data.length; i < limit; i = (i + 4)|0 ) {

        i1 = i + 1;
        i2 = i + 2;
        r = data[ i ];
        g = data[ i1 ];
        b = data[ i2 ];

        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        //value = r*0.2126 + g*0.7152 + b*0.0722;
        data[ i ] = data[ i1 ] = data[ i2 ] = r*0.2126 + g*0.7152 + b*0.0722;

      }

    };

    return Grayscale;

  }() );

}( window ) );
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
/*jslint -W016*/
/**
 * @module Igata
 * @type {Blur}
 */
( function ( window ) {

  'use strict';

  var
    //document = window.document,
    Igata = window.Igata;

  var Stack = ( function () {

    /**
     * Blur inner class
     * @class Stack
     * @constructor
     */
    function Stack () {

      /**
       * @property r
       * @type {number}
       */
      this.r = 0;
      /**
       * @property g
       * @type {number}
       */
      this.g = 0;
      /**
       * @property b
       * @type {number}
       */
      this.b = 0;
      /**
       * @property a
       * @type {number}
       */
      this.a = 0;
      /**
       * @property next
       * @type {null|Stack}
       */
      this.next = null;

      // Object.defineProperties
      // Chrome はありえないほど遅くなるので使わない

      //var
      //  r = 0,
      //  g = 0,
      //  b = 0,
      //  a = 0,
      //  next = null;
      //
      //Object.defineProperties(
      //  this,
      //  {
      //    /**
      //     * @property r
      //     * @type {number}
      //     */
      //    'r': {
      //      get: function () {
      //
      //        return r;
      //
      //      },
      //      set: function ( value ) {
      //
      //        r = value;
      //
      //      }
      //    },
      //    /**
      //     * @property g
      //     * @type {number}
      //     */
      //    'g': {
      //      get: function () {
      //
      //        return g;
      //
      //      },
      //      set: function ( value ) {
      //
      //        g = value;
      //
      //      }
      //    },
      //    /**
      //     * @property b
      //     * @type {number}
      //     */
      //    'b': {
      //      get: function () {
      //
      //        return b;
      //
      //      },
      //      set: function ( value ) {
      //
      //        b = value;
      //
      //      }
      //    },
      //    /**
      //     * @property a
      //     * @type {number}
      //     */
      //    'a': {
      //      get: function () {
      //
      //        return a;
      //
      //      },
      //      set: function ( value ) {
      //
      //        a = value;
      //
      //      }
      //    },
      //    /**
      //     * @property next
      //     * @type {number}
      //     */
      //    'next': {
      //      get: function () {
      //
      //        return next;
      //
      //      },
      //      set: function ( value ) {
      //
      //        next = value;
      //
      //      }
      //    }
      //  }
      //);

    }

    var p = Stack.prototype;
    p.constructor = Stack;

    return Stack;

  }() );

  // http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html

  Igata.Blur = ( function () {

    var
      Filter = Igata.Filter,
      /**
       * @property mul_table
       * @static
       * @private
       * @type {number[]}
       */
      mul_table = [
        512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
        454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
        482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
        437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
        497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
        320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
        446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
        329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
        505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
        399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
        324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
        268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
        451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
        385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
        332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
        289,287,285,282,280,278,275,273,271,269,267,265,263,261,259 ],
      /**
       * @property shg_table
       * @static
       * @private
       * @type {number[]}
       */
      shg_table = [
         9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
        17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

    /**
     * filter: blur
     *
     * http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html
     *
     * @class Blur
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Blur ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Blur );

    var p = Blur.prototype;
    p.constructor = Blur;

    /**
     * blur filter を実行
     * @method filter
     * @param {number=8} [radius]
     * @param {boolean=false} [alpha]
     */
    p.filter = function ( radius, alpha ) {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data;

      data = new Uint8ClampedArray( bitmap.identity );
      //data = imageData.data;

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
      // isNaN(undefined) true
      // isNaN(null) false
      if ( isNaN( radius ) ) {

        radius = 8;

      }
      // convert if float => int
      // 整数変換
      radius |= 0;

      if ( radius !== 0 ) {

        //var time = Date.now();
        //console.log( '************** start ', time, radius );

        if ( !!alpha ) {

          this._rgba( data, radius, imageData.width, imageData.height );

        } else {

          this._rgb( data, radius, imageData.width, imageData.height );

        }

        //var out = Date.now();
        //console.log( 'time: ', (out-time) / 1000 );
        //console.log( '************** end ', out );

        // inner Class Stack の Object.defineProperties を使用しない
        // まだ遅い
        // ToDo; Chrome slower than others

        //console.log( "filter ", radius, alpha, !!pixels );
        imageData.data.set( data );
        ctx.putImageData( imageData, 0, 0 );

      } else {

        this.restore();

      }


    };

    /**
     * @method _rgba
     * @param {Uint8ClampedArray} pixels
     * @param {number} radius
     * @param {number} width
     * @param {number} height
     * @private
     */
    p._rgba = function ( pixels, radius, width, height ) {

      var
        x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
        r_out_sum, g_out_sum, b_out_sum, a_out_sum,
        r_in_sum, g_in_sum, b_in_sum, a_in_sum,
        pr, pg, pb, pa, rbs,
        stackEnd;

      var div = radius + radius + 1;
      //var w4 = width << 2;
      var widthMinus1  = width - 1;
      var heightMinus1 = height - 1;
      var radiusPlus1  = radius + 1;
      var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

      var stackStart = new Stack();
      var stack = stackStart;

      for ( i = 1; i < div; i = (i+1)|0 ) {

        stack = stack.next = new Stack();

        if ( i === radiusPlus1 ) {

          stackEnd = stack;

        }

      }

      stack.next = stackStart;
      var stackIn = null;
      var stackOut = null;

      yw = yi = 0;

      var mul_sum = mul_table[radius];
      var shg_sum = shg_table[radius];

      for ( y = 0; y < height; y = (y+1)|0 ) {

        r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;

        r_out_sum = radiusPlus1 * ( pr = pixels[ yi ] );
        g_out_sum = radiusPlus1 * ( pg = pixels[ yi+1 ] );
        b_out_sum = radiusPlus1 * ( pb = pixels[ yi+2 ] );
        a_out_sum = radiusPlus1 * ( pa = pixels[ yi+3 ] );

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;

        stack = stackStart;

        for( i = 0; i < radiusPlus1; i = (i+1)|0 ) {

          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack.a = pa;
          stack = stack.next;

        }

        for( i = 1; i < radiusPlus1; i = (i+1)|0 ) {

          p = yi + ( ( widthMinus1 < i ? widthMinus1 : i ) << 2 );
          r_sum += ( stack.r = ( pr = pixels[ p ] ) ) * ( rbs = radiusPlus1 - i );
          g_sum += ( stack.g = ( pg = pixels[ p+1 ] ) ) * rbs;
          b_sum += ( stack.b = ( pb = pixels[ p+2 ] ) ) * rbs;
          a_sum += ( stack.a = ( pa = pixels[ p+3 ] ) ) * rbs;

          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          a_in_sum += pa;

          stack = stack.next;

        }

        stackIn = stackStart;
        stackOut = stackEnd;

        for ( x = 0; x < width; x = (x+1)|0 ) {

          pixels[ yi+3 ] = pa = ( a_sum * mul_sum ) >> shg_sum;

          if ( pa !== 0 ) {

            pa = 255 / pa;
            pixels[ yi ]   = ( ( r_sum * mul_sum ) >> shg_sum ) * pa;
            pixels[ yi+1 ] = ( ( g_sum * mul_sum ) >> shg_sum ) * pa;
            pixels[ yi+2 ] = ( ( b_sum * mul_sum ) >> shg_sum ) * pa;

          } else {

            pixels[ yi ] = pixels[ yi+1 ] = pixels[ yi+2 ] = 0;

          }

          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          a_sum -= a_out_sum;

          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          a_out_sum -= stackIn.a;

          p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

          r_in_sum += ( stackIn.r = pixels[ p ] );
          g_in_sum += ( stackIn.g = pixels[ p+1 ] );
          b_in_sum += ( stackIn.b = pixels[ p+2 ] );
          a_in_sum += ( stackIn.a = pixels[ p+3 ] );

          r_sum += r_in_sum;
          g_sum += g_in_sum;
          b_sum += b_in_sum;
          a_sum += a_in_sum;

          stackIn = stackIn.next;

          r_out_sum += ( pr = stackOut.r );
          g_out_sum += ( pg = stackOut.g );
          b_out_sum += ( pb = stackOut.b );
          a_out_sum += ( pa = stackOut.a );

          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          a_in_sum -= pa;

          stackOut = stackOut.next;

          yi = (yi+4)|0;

        }

        yw = yw + width;

      }


      for ( x = 0; x < width; x = (x+1)|0 ) {

        g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;

        yi = x << 2;
        r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
        g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
        b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
        a_out_sum = radiusPlus1 * ( pa = pixels[yi+3]);

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;

        stack = stackStart;
        yp = width;

        for( i = 0; i < radiusPlus1; i = (i+1)|0 ) {

          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack.a = pa;
          stack = stack.next;

        }

        //yp = width;

        for( i = 1; i <= radius; i = (i+1)|0 ) {

          yi = ( yp + x ) << 2;

          r_sum += ( stack.r = ( pr = pixels[ yi ] ) ) * ( rbs = radiusPlus1 - i );
          g_sum += ( stack.g = ( pg = pixels[ yi+1 ] ) ) * rbs;
          b_sum += ( stack.b = ( pb = pixels[ yi+2 ] ) ) * rbs;
          a_sum += ( stack.a = ( pa = pixels[ yi+3 ] ) ) * rbs;

          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;
          a_in_sum += pa;

          stack = stack.next;

          if( i < heightMinus1 ) {

            yp += width;

          }

        }

        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;

        for ( y = 0; y < height; y = (y+1)|0 ) {

          p = yi << 2;
          pixels[ p+3 ] = pa = ( a_sum * mul_sum ) >> shg_sum;

          if ( pa > 0 ) {

            pa = 255 / pa;
            pixels[ p ]   = ( ( r_sum * mul_sum ) >> shg_sum ) * pa;
            pixels[ p+1 ] = ( ( g_sum * mul_sum ) >> shg_sum ) * pa;
            pixels[ p+2 ] = ( ( b_sum * mul_sum ) >> shg_sum ) * pa;

          } else {

            pixels[ p ] = pixels[ p+1 ] = pixels[ p+2 ] = 0;

          }

          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;
          a_sum -= a_out_sum;

          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;
          a_out_sum -= stackIn.a;

          p = ( x + ( ( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width ) ) << 2;

          r_sum += ( r_in_sum += ( stackIn.r = pixels[ p ] ) );
          g_sum += ( g_in_sum += ( stackIn.g = pixels[ p+1 ] ) );
          b_sum += ( b_in_sum += ( stackIn.b = pixels[ p+2 ] ) );
          a_sum += ( a_in_sum += ( stackIn.a = pixels[ p+3 ] ) );

          stackIn = stackIn.next;

          r_out_sum += ( pr = stackOut.r );
          g_out_sum += ( pg = stackOut.g );
          b_out_sum += ( pb = stackOut.b );
          a_out_sum += ( pa = stackOut.a );

          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;
          a_in_sum -= pa;

          stackOut = stackOut.next;

          yi += width;

        }

      }

    };

    /**
     * @method _rgb
     * @param {Uint8ClampedArray} pixels
     * @param {number} radius
     * @param {number} width
     * @param {number} height
     * @private
     */
    p._rgb = function ( pixels, radius, width, height ) {

      var
        x, y, i, p,
        yp, yi, yw,
        r_sum, g_sum, b_sum,
        r_out_sum, g_out_sum, b_out_sum,
        r_in_sum, g_in_sum, b_in_sum,
        pr, pg, pb, rbs,
        stackEnd;

      var div = radius + radius + 1;
      //var w4 = width << 2;
      var widthMinus1  = width - 1;
      var heightMinus1 = height - 1;
      var radiusPlus1  = radius + 1;
      var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

      var stackStart = new Stack();
      var stack = stackStart;

      for ( i = 1; i < div; i = (i+1)|0 ) {

        stack = stack.next = new Stack();
        if ( i === radiusPlus1 ) {

          stackEnd = stack;

        }

      }// for

      stack.next = stackStart;
      var stackIn = null;
      var stackOut = null;

      yw = yi = 0;

      var mul_sum = mul_table[ radius ];
      var shg_sum = shg_table[ radius ];

      for ( y = 0; y < height; y = (y+1)|0 ) {

        r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

        r_out_sum = radiusPlus1 * ( pr = pixels[ yi ] );
        g_out_sum = radiusPlus1 * ( pg = pixels[ yi+1 ] );
        b_out_sum = radiusPlus1 * ( pb = pixels[ yi+2 ] );

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;

        stack = stackStart;

        for( i = 0; i < radiusPlus1; i = (i+1)|0 ) {

          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;

        }

        for( i = 1; i < radiusPlus1; i = (i+1)|0 ) {

          p = yi + ( ( widthMinus1 < i ? widthMinus1 : i ) << 2 );
          r_sum += ( stack.r = ( pr = pixels[ p ] ) ) * ( rbs = radiusPlus1 - i );
          g_sum += ( stack.g = ( pg = pixels[ p+1 ] ) ) * rbs;
          b_sum += ( stack.b = ( pb = pixels[ p+2 ] ) ) * rbs;

          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;

          stack = stack.next;

        }

        stackIn = stackStart;
        stackOut = stackEnd;

        for ( x = 0; x < width; x = (x+1)|0 ) {

          pixels[ yi ]   = ( r_sum * mul_sum ) >> shg_sum;
          pixels[ yi+1 ] = ( g_sum * mul_sum ) >> shg_sum;
          pixels[ yi+2 ] = ( b_sum * mul_sum ) >> shg_sum;

          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;

          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;

          p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

          r_in_sum += ( stackIn.r = pixels[ p ] );
          g_in_sum += ( stackIn.g = pixels[ p+1 ] );
          b_in_sum += ( stackIn.b = pixels[ p+2 ] );

          r_sum += r_in_sum;
          g_sum += g_in_sum;
          b_sum += b_in_sum;

          stackIn = stackIn.next;

          r_out_sum += ( pr = stackOut.r );
          g_out_sum += ( pg = stackOut.g );
          b_out_sum += ( pb = stackOut.b );

          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;

          stackOut = stackOut.next;

          yi = (yi+4)|0;

        }

        yw = yw + width;

      }//for ( y = 0; y < height; y = (y+1)|0 )

      for ( x = 0; x < width; x = (x+1)|0 ) {

        g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

        yi = x << 2;
        r_out_sum = radiusPlus1 * ( pr = pixels[ yi ] );
        g_out_sum = radiusPlus1 * ( pg = pixels[ yi+1 ] );
        b_out_sum = radiusPlus1 * ( pb = pixels[ yi+2 ] );

        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;

        stack = stackStart;
        yp = width;

        for( i = 0; i < radiusPlus1; i = (i+1)|0 ) {

          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;

        }

        //yp = width;

        for( i = 1; i <= radius; i = (i+1)|0 ) {

          yi = ( yp + x ) << 2;

          r_sum += ( stack.r = ( pr = pixels[ yi ] ) ) * ( rbs = radiusPlus1 - i );
          g_sum += ( stack.g = ( pg = pixels[ yi+1 ] ) ) * rbs;
          b_sum += ( stack.b = ( pb = pixels[ yi+2 ] ) ) * rbs;

          r_in_sum += pr;
          g_in_sum += pg;
          b_in_sum += pb;

          stack = stack.next;

          if( i < heightMinus1 ) {

            yp += width;

          }

        }

        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;

        for ( y = 0; y < height; y = (y+1)|0 ) {

          p = yi << 2;
          pixels[ p ]   = ( r_sum * mul_sum ) >> shg_sum;
          pixels[ p+1 ] = ( g_sum * mul_sum ) >> shg_sum;
          pixels[ p+2 ] = ( b_sum * mul_sum ) >> shg_sum;

          r_sum -= r_out_sum;
          g_sum -= g_out_sum;
          b_sum -= b_out_sum;

          r_out_sum -= stackIn.r;
          g_out_sum -= stackIn.g;
          b_out_sum -= stackIn.b;

          p = ( x + ( ( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width ) ) << 2;

          r_sum += ( r_in_sum += ( stackIn.r = pixels[ p ] ) );
          g_sum += ( g_in_sum += ( stackIn.g = pixels[ p+1 ] ) );
          b_sum += ( b_in_sum += ( stackIn.b = pixels[ p+2 ] ) );

          stackIn = stackIn.next;

          r_out_sum += ( pr = stackOut.r );
          g_out_sum += ( pg = stackOut.g );
          b_out_sum += ( pb = stackOut.b );

          r_in_sum -= pr;
          g_in_sum -= pg;
          b_in_sum -= pb;

          stackOut = stackOut.next;

          yi = yi + width;

        }

      }

      //return pixels;

    };

    return Blur;

  }() );

}( window ) );
/*jslint -W016*/
/**
 * @module Igata
 * @type {Convolution}
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata;

  Igata.Convolution = ( function () {

    var
      Filter = Igata.Filter,

      _round = Igata._round,
      _sqrt = Igata._sqrt,
      _floor = Igata._floor,
      _PI = Igata._PI,
      _exp = Igata._exp;

    /**
     *
     * @class Convolution
     * @extends Filter
     * @param {Bitmap} bitmap
     * @constructor
     */
    function Convolution ( bitmap ) {

      Filter.call( this, bitmap );

    }

    Igata.extend( Filter, Convolution );

    var p = Convolution.prototype;
    p.constructor = Convolution;

    /**
     * @method filter
     * @param {Array} [weights] 3 x 3 Matrix
     * @default [1,1,1,1,0.7,-1,-1,-1,-1]
     */
    p.filter = function ( weights ) {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        data;

      if ( typeof weights === 'undefined' ) {

        // weights undefined
        weights = [
          1, 1,  1,
          1, 0.7,  -1,
          -1, -1,  -1
        ];

      }

      data = this.convolute( ctx, imageData, weights, true );
      ctx.putImageData( data, 0, 0 );

    };

    /**
     * @method sharpen
     * @param {boolean=false} [opaque]
     */
    p.sharpen = function ( opaque ) {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        weights = [
           0, -1,  0,
          -1,  5, -1,
           0, -1,  0
        ],
        data;

      opaque = !!opaque;

      data = this.convolute( ctx, imageData, weights, opaque );
      //console.log( 'sharpen ', data );
      //imageData.data.set( data );
      ctx.putImageData( data, 0, 0 );

    };

    /**
     * box blur
     * @method blur
     * @param {number} k
     * @default 0.1111111
     */
    p.blur = function ( k ) {

      if ( isNaN( k ) || k <= 0 ) {

        k = 1 / 9;

      }

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        weights = [
          k, k,  k,
          k, k,  k,
          k, k,  k
        ],
        data;

      data = this.convolute( ctx, imageData, weights, false );
      ctx.putImageData( data, 0, 0 );

    };

    /**
     * https://github.com/wellflat/javascript-labs
     * @method gaussian
     * @param {number} radius
     */
    p.gaussian = function ( radius ) {

      var
        bitmap = this.bitmap,
        ctx = bitmap.context,
        imageData = this.imageData( bitmap ),
        weights = [],
        //size = (2*radius + 1)*(2*radius + 1),
        sigma = 0.849321800288,
        k = 1.0 / _sqrt( 2.0*_PI ) / sigma,
        f = 0,
        data,
        y, x;

      for ( y = -radius; y <= radius; y++ ) {

        for ( x = -radius; x <= radius; x++ ) {

          f = k*_exp( -( x*x + y*y ) / ( 2*sigma*sigma ) );
          weights.push(f);

        }

      }
      console.log( 'gaussian ', radius, weights );
      data = this.convolute( ctx, imageData, weights, false );
      ctx.putImageData( data, 0, 0 );

    };

    // http://www.html5rocks.com/en/tutorials/canvas/imagefilters/

    /**
     * @method convolute
     * @param {CanvasRenderingContext2D} ctx
     * @param {ImageData} imageData
     * @param {Array} weights
     * @param {boolean}  opaque
     * @return {ImageData}
     */
    p.convolute = function ( ctx, imageData, weights, opaque ) {

      var side = _round( _sqrt( weights.length ) );
      var halfSide = _floor( side * 0.5 );
      var src = imageData.data;
      var sw = imageData.width;
      var sh = imageData.height;
      // pad output by the convolution matrix
      var w = sw;
      var h = sh;
      var output = ctx.createImageData( w, h );
      var dst = output.data;
      // go through the destination image pixels
      var alphaFac = opaque ? 1 : 0;

      var
        y, x,
        sy, sx, dstOff,
        r, g, b, a,
        cy, cx,
        scy, scx,
        srcOff,
        wt;

      for ( y=0; y<h; y = (y+1)|0 ) {

        for ( x=0; x<w; x = (x+1)|0 ) {

          sy = y;
          sx = x;
          dstOff = ( y*w+x ) * 4;
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          r=0;
          g=0;
          b=0;
          a=0;

          for ( cy=0; cy<side; cy = (cy+1)|0 ) {

            for ( cx=0; cx<side; cx = (cx+1)|0 ) {

              scy = sy + cy - halfSide;
              scx = sx + cx - halfSide;

              if ( scy >= 0 && scy < sh && scx >= 0 && scx < sw ) {

                srcOff = ( scy*sw+scx ) * 4;
                wt = weights[ cy*side+cx ];

                r += src[ srcOff ] * wt;
                g += src[ srcOff+1 ] * wt;
                b += src[ srcOff+2 ] * wt;
                a += src[ srcOff+3 ] * wt;

              }

            }

          }

          dst[ dstOff ] = r;
          dst[ dstOff+1 ] = g;
          dst[ dstOff+2 ] = b;
          dst[ dstOff+3 ] = a + alphaFac * ( 255-a );

        }
      }

      return output;

    };

    return Convolution;

  }() );

}( window ) );
/*jslint -W016*/
( function ( window ) {

  'use strict';

  var
    document = window.document,
    Igata = window.Igata;

  Igata.Match = ( function () {

    var
      _abs = Igata._abs,
      _sqrt = Igata._sqrt;

    function Match () {

    }

    var p = Match.prototype;
    p.constructor = Match;

    Match.overall = function ( a, b, callback ) {

      var m = a[ 0 ].length === b[ 0 ].length ? a[0].length : null;
      var n = a.length === b.length ? a.length : null;
      var
        i, j;

      if ( m === null || n === null ) {

        throw new Error( 'Matrices don\'t have the same size.' );

      }

      for ( i = 0; i < m; i = (i+1)|0 ) {

        for ( j = 0; j < n; j = (j+1)|0 ) {

          callback( a[ i ][ j ], b[ i ][ j ] );

        }
      }

    };

    Match.mean = function ( a ) {

      var sum = 0;
      var m = a[ 0 ].length;
      var n = a.length;
      var
        i, j;

      for ( i = 0; i < m; i = (i+1)|0 ) {

        for ( j = 0; j < n; j = (j+1)|0 ) {

          sum += a[ i ][ j ];

        }
      }
      console.log( 'mean ', sum, m, n, sum / (m * n) );

      return sum / (m * n);

    };

    Match.sad = function ( a, b ) {

      var sum = 0;

      Match.overall( a, b, function( ca, cb ) {

        sum += _abs( ca - cb );

      });

      return sum;

    };

    Match.ssd = function ( a, b ) {

      var sum = 0;

      Match.overall( a, b, function( ca, cb ) {

        var c = ca - cb;
        sum += c * c;

      });

      return sum;

    };

    Match.zncc = function ( a, b ) {

      var mean_A = Match.mean( a );
      var mean_B = Match.mean( b );

      var numerator = 0;
      var result;
      var denumerator = 0;
      var denumerator_2 = 0;

      Match.overall( a, b, function( ca, cb ) {

        var
          caa = ca - mean_A,
          cbb = cb - mean_B;

        numerator += ( caa ) * ( cbb );
        denumerator += ( caa ) * ( caa );
        denumerator_2 += ( cbb ) * ( cbb );

      });

      result = _sqrt( denumerator * denumerator_2 );

      return numerator / result;

    };

    return Match;

  }() );

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/04 - 17:26
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
    document = window.document,
    Igata = window.Igata;

  Igata.Template = ( function () {

    var
      Grayscale = Igata.Grayscale,

      _abs = Igata._abs;

    function Template () {

    }

    var p = Template.prototype;
    p.constructor = Template;

    p.match = function ( target, template, percent ) {

      var
        targetData = new Uint8ClampedArray( target.data ),
        templateData = new Uint8ClampedArray( template.data ),

        targetHeight, targetWidth,
        templateHeight, templateWidth,
        y, yEnd,
        x, xEnd,

        ty, tx,

        count,
        i, ti;

      percent = percent || 0.9;

      Grayscale.to( targetData );
      Grayscale.to( templateData );

      targetHeight = target.height;
      targetWidth = target.width;

      templateHeight = template.height;
      templateWidth = template.width;

      for ( y = 0, yEnd = targetHeight - templateHeight + 1; y < yEnd; y = (y + 1)|0 ) {

         for ( x = 0, xEnd = targetWidth - templateWidth + 1; x < xEnd; x = (x + 1)|0 ) {

           count = 0;

           for ( ty = 0; ty < templateHeight; ty = (ty + 1)|0 ) {

              for ( tx = 0; tx < templateWidth; tx = (tx + 1)|0 ) {

                ti = tx + templateWidth * ty;
                i = (x + tx) + targetWidth * ( y + ty );

                if ( targetData[ i ] === templateData[ ti ] ) {

                  count = (count+1)|0;

                }

              }

           }

         }

      }

      return templateWidth * templateHeight * percent <= count;

    };

    p.sad = function ( target, template, percent ) {

      var
        targetData = new Uint8ClampedArray( target.data ),
        templateData = new Uint8ClampedArray( template.data ),

        targetHeight, targetWidth,
        templateHeight, templateWidth,
        y, yEnd,
        x, xEnd,

        ty, tx,

        similar,
        normal,

        i, ti,
        skip,
        result,
        pixels;

      percent = percent || 0.2;

      Grayscale.to( targetData );
      Grayscale.to( templateData );

      targetHeight = target.height;
      targetWidth = target.width;

      templateHeight = template.height;
      templateWidth = template.width;

      pixels = templateWidth * templateHeight * 256;

      var start = Date.now();
      console.log( 'sad ', start );
      //skip = false;

      for ( y = 0, yEnd = targetHeight - templateHeight + 1; y < yEnd; y = (y + 1)|0 ) {

        //if ( skip ) {
        //
        //  break;
        //
        //}

         for ( x = 0, xEnd = targetWidth - templateWidth + 1; x < xEnd; x = (x + 1)|0 ) {

           similar = 0;
           normal = 0;
           skip = false;

           for ( ty = 0; ty < templateHeight; ty = (ty + 1)|0 ) {

             if ( skip ) {

               continue;

             }

              for ( tx = 0; tx < templateWidth; tx = (tx + 1)|0 ) {

                if ( normal > percent ) {

                  continue;

                }

                ti = tx + templateWidth * ty;
                i = (x + tx) + targetWidth * ( y + ty );

                similar = similar + _abs( targetData[ i ] - templateData[ ti ] );
                normal = similar / pixels;

                if ( normal > percent ) {

                  skip = true;

                }

              }

           }

           //normal = similar / pixels;

           if ( percent >= normal ) {

             percent = normal;
             //console.log( 'normal ', normal, similar, pixels );
             //skip = true;
             result = {
               normalize: normal,
               similar: similar,
               x: x,
               y: y,
               width: templateWidth,
               height: templateHeight
             };
             //break;

           }

         }

      }

      console.log( '------------------------- ', (Date.now() - start) / 1000 );

      return result;

    };

    return Template;

  }() );

}( window ) );