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
 * build 2015-09-09 19:51:53
 * git https://github.com/taikiken/igata.js
 *
 */
/*jslint -W016*/
/**
 * HTML 5 Canvas image effects.
 *
 * brightness, invert, grayscale, threshold, blur, convolution...
 *
 * @module Igata
 * @type {Igata}
 */
var Igata = window.Igata || {};

( function ( window, Igata ){
  "use strict";

  var
    global = Igata;

  // alias methods
  global.Float32Array = window.Float32Array;

  global._random = Math.random;

  global._abs = Math.abs;

  global._min = Math.min;

  global._max = Math.max;

  global._sqrt = Math.sqrt;

  global._cos = Math.cos;

  global._sin = Math.sin;

  global._round = Math.round;

  global._floor = Math.floor;

  global._exp = Math.exp;

  global._PI = Math.PI;

  ///**
  // * @property EPSILON
  // * @for Igata
  // * @static
  // * @readonly
  // * @type {number}
  // * @default 0.000001
  // */
  //Igata.EPSILON = 0.000001;

  /**
   * @method extend
   * @for Igata
   * @static
   * @param {function} Parent
   * @param {function} Child
   */
  global.extend = function ( Parent, Child ) {

    Child.prototype = Object.create( Parent.prototype );
    Child.prototype.constructor = Child;

  };

  // CONSTANTS
  var EPSILON = 0.0000001192092896;
  var FLT_MIN = 1E-37;

  // implementation from CCV project
  // currently working only with u8,s32,f32
  var
    U8_t = 0x0100,
    S32_t = 0x0200,
    F32_t = 0x0400,
    S64_t = 0x0800,
    F64_t = 0x1000;

  var
    C1_t = 0x01,
    C2_t = 0x02,
    C3_t = 0x03,
    C4_t = 0x04;

  var _data_type_size = new Int32Array([ -1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8 ]);

  function get_data_type ( type ) {

    return ( type & 0xFF00 );

  }

  function get_channel ( type ) {

    return ( type & 0xFF );

  }

  function get_data_type_size ( type ) {

    return _data_type_size[ ( type & 0xFF00 ) >> 8 ];

  }

  // color conversion
  var COLOR_RGBA2GRAY = 0;
  var COLOR_RGB2GRAY = 1;
  var COLOR_BGRA2GRAY = 2;
  var COLOR_BGR2GRAY = 3;

  // box blur option
  var BOX_BLUR_NOSCALE = 0x01;
  // svd options
  var SVD_U_T = 0x01;
  var SVD_V_T = 0x02;

  // copy to global
  // data types
  global.U8_t = U8_t;
  global.S32_t = S32_t;
  global.F32_t = F32_t;
  global.S64_t = S64_t;
  global.F64_t = F64_t;
  // data channels
  global.C1_t = C1_t;
  global.C2_t = C2_t;
  global.C3_t = C3_t;
  global.C4_t = C4_t;

  // popular formats
  global.U8C1_t = U8_t | C1_t;
  global.U8C3_t = U8_t | C3_t;
  global.U8C4_t = U8_t | C4_t;

  global.F32C1_t = F32_t | C1_t;
  global.F32C2_t = F32_t | C2_t;
  global.S32C1_t = S32_t | C1_t;
  global.S32C2_t = S32_t | C2_t;

  // constants
  global.EPSILON = EPSILON;
  global.FLT_MIN = FLT_MIN;

  // color convert
  global.COLOR_RGBA2GRAY = COLOR_RGBA2GRAY;
  global.COLOR_RGB2GRAY = COLOR_RGB2GRAY;
  global.COLOR_BGRA2GRAY = COLOR_BGRA2GRAY;
  global.COLOR_BGR2GRAY = COLOR_BGR2GRAY;

  // options
  global.BOX_BLUR_NOSCALE = BOX_BLUR_NOSCALE;
  global.SVD_U_T = SVD_U_T;
  global.SVD_V_T = SVD_V_T;

  global.get_data_type = get_data_type;
  global.get_channel = get_channel;
  global.get_data_type_size = get_data_type_size;

}( window, Igata ) );

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

                if ( skip ) {

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
             console.log( 'normal ', normal, similar, pixels );
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
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/08 - 14:29
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
/**
 * original code
 * http://inspirit.github.io/jsfeat/#structs
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,

    global = Igata;

  //
  //// CONSTANTS
  //var EPSILON = global.EPSILON;
  //var FLT_MIN = global.FLT_MIN;

  // implementation from CCV project
  // currently working only with u8,s32,f32
  var
    U8_t = global.U8_t,
    S32_t = global.S32_t,
    F32_t = global.F32_t;

  //var
  //  C1_t = global.C1_t,
  //  C2_t = global.C2_t,
  //  C3_t = global.C3_t,
  //  C4_t = global.C4_t;

  var _data_type_size = new Int32Array([ -1, 1, 4, -1, 4, -1, -1, -1, 8, -1, -1, -1, -1, -1, -1, -1, 8 ]);

  /**
   * @for Igata
   * @method dataType
   * @static
   * @param {number} type
   * @return {number}
   */
  function dataType ( type ) {

    return ( type & 0xFF00 );

  }
  /**
   * @deprecated instead use dataType
   * @for Igata
   * @method get_data_type
   * @static
   * @param {number} type
   * @return {number}
   */
  function get_data_type ( type ) {

    return dataType( type & 0xFF00 );

  }

  // alias
  global.dataType = dataType;
  global.get_data_type = dataType;

  /**
   * @for Igata
   * @method channel
   * @static
   * @param {number} type
   * @return {number}
   */
  function  channel ( type ) {

    return ( type & 0xFF );

  }
  /**
   * @deprecated instead use channel
   * @for Igata
   * @method get_channel
   * @static
   * @param {number} type
   * @return {number}
   */
  function get_channel ( type ) {

    return channel( type & 0xFF );

  }

  // alias
  global.channel = channel;
  global.get_channel = channel;


  /**
   * @for Igata
   * @method dataTypeSize
   * @static
   * @param {number} type
   * @return {*}
   */
  function dataTypeSize ( type ) {

    return _data_type_size[ ( type & 0xFF00 ) >> 8 ];

  }
  /**
   * @deprecated instead use dataTypeSize
   * @for Igata
   * @method get_data_type_size
   * @static
   * @param {number} type
   * @return {*}
   */
  function get_data_type_size ( type ) {

    return dataTypeSize( type );

  }

  // alias
  global.dataTypeSize = dataTypeSize;
  global.get_data_type_size = dataTypeSize;

  // color conversion
  //var COLOR_RGBA2GRAY = global.COLOR_RGBA2GRAY;
  //var COLOR_RGB2GRAY = global.COLOR_RGB2GRAY;
  //var COLOR_BGRA2GRAY = global.COLOR_BGRA2GRAY;
  //var COLOR_BGR2GRAY = global.COLOR_BGR2GRAY;
  //
  //// box blur option
  //var BOX_BLUR_NOSCALE = global.BOX_BLUR_NOSCALE;
  //// svd options
  //var SVD_U_T = global.SVD_U_T;
  //var SVD_V_T = global.SVD_V_T;

  // -------------------------------------------------------------------
  // inner classes

  // Data_t
  var Data_t = ( function () {

    /**
     * @class Data_t
     * @param {number} size_in_bytes
     * @param {ArrayBuffer} buffer
     * @constructor
     */
    function Data_t ( size_in_bytes, buffer ) {

      // we need align size to multiple of 8
      /**
       * @property size
       * @type {number}
       */
      this.size = ((size_in_bytes + 7) | 0) & -8;

      if (typeof buffer === "undefined") {

        /**
         * @property buffer
         * @type {ArrayBuffer}
         */
        this.buffer = new ArrayBuffer(this.size);

      } else {

        this.buffer = buffer;
        this.size   = buffer.length;

      }

      /**
       * @property u8
       * @type {Uint8Array}
       */
      this.u8  = new Uint8Array( this.buffer );
      /**
       * @property i32
       * @type {Int32Array}
       */
      this.i32 = new Int32Array( this.buffer );
      /**
       * @property f32
       * @type {Float32Array}
       */
      this.f32 = new Float32Array (this.buffer );
      /**
       * @property f64
       * @type {Float64Array}
       */
      this.f64 = new Float64Array( this.buffer );

    }

    var p = Data_t.prototype;
    p.constructor = Data_t;

    return Data_t;

  }() );

  // Matrix_t
  var Matrix_t = ( function () {

    // columns, rows, data_type
    /**
     * @class Matrix_t
     * @param {number} c columns
     * @param {number} r rows
     * @param {number} data_type
     * @param {Data_t} [data_buffer]
     * @constructor
     */
    function Matrix_t ( c, r, data_type, data_buffer ) {

      /**
       * @property type
       * @type {number}
       */
      this.type = dataType( data_type )|0;
      /**
       * @property channel
       * @type {number}
       */
      this.channel = channel( data_type )|0;
      /**
       * @property cols
       * @type {number}
       */
      this.cols = c|0;
      /**
       * @property rows
       * @type {number}
       */
      this.rows = r|0;

      if (typeof data_buffer === 'undefined') {

        this.allocate();

      } else {

        /**
         * @property buffer
         * @type {Data_t}
         */
        this.buffer = data_buffer;
        // data user asked for
        /**
         * @property data
         * @type {number}
         */
        this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));

      }

    }

    var p = Matrix_t.prototype;
    p.constructor = Matrix_t;

    /**
     * @method allocate
     */
    p.allocate = function () {

      // clear references
      delete this.data;
      delete this.buffer;
      //
      this.buffer = new Data_t((this.cols * dataTypeSize(this.type) * this.channel) * this.rows);
      this.data = this.type&U8_t ? this.buffer.u8 : (this.type&S32_t ? this.buffer.i32 : (this.type&F32_t ? this.buffer.f32 : this.buffer.f64));

    };
    /**
     * this copy to other data
     * @method copy
     * @param {Matrix_t} other
     */
    p.copy = function ( other ) {

      var od = other.data, td = this.data;
      var i = 0, n = (this.cols*this.rows*this.channel)|0;
      var limit = n-4;

      for(; i < limit; i+=4) {

        od[i] = td[i];
        od[i+1] = td[i+1];
        od[i+2] = td[i+2];
        od[i+3] = td[i+3];

      }

      for(; i < n; ++i) {

        od[i] = td[i];

      }

    };
    /**
     * @deprecated instead use copy
     * @method copy_to
     * @param {Matrix_t} other
     */
    p.copy_to = function ( other ) {

      this.copy( other );

    };

    /**
     * @method resize
     * @param {number} c columns
     * @param {number} r rows
     * @param {number} [ch] undefined の時は this.channel を設定します
     */
    p.resize = function ( c, r, ch ) {

      if ( typeof ch === 'undefined' ) { ch = this.channel; }

      // relocate buffer only if new size doesnt fit
      var new_size = ( c * dataTypeSize( this.type ) * ch ) * r;

      if( new_size > this.buffer.size ) {

        this.cols = c;
        this.rows = r;
        this.channel = ch;
        this.allocate();

      } else {

        this.cols = c;
        this.rows = r;
        this.channel = ch;

      }

    };

    return Matrix_t;

  }() );

  // Pyramid_t move to Processing
  // 循環参照になるため
  ////
  //var Pyramid_t = ( function () {
  //
  //  function Pyramid_t ( levels ) {
  //
  //    this.levels = levels|0;
  //    this.data = new Array( levels );
  //    this.pyrdown = jsfeat.imgproc.pyrdown;
  //
  //  }
  //
  //  var p = Pyramid_t.prototype;
  //  p.constructor = Pyramid_t;
  //
  //  p.init = function () {
  //  };
  //
  //  return Pyramid_t;
  //
  //}() );

  var Keypoint_t = ( function () {

    /**
     * @class Keypoint_t
     * @param {number=0} [x]
     * @param {number=0} [y]
     * @param {number=0} [score]
     * @param {number=0} [level]
     * @param {number} [angle]
     * @default -1.0
     * @constructor
     */
    function Keypoint_t ( x, y, score, level, angle ) {

      if (typeof x === 'undefined') { x = 0; }
      if (typeof y === 'undefined') { y = 0; }
      if (typeof score === 'undefined') { score = 0; }
      if (typeof level === 'undefined') { level = 0; }
      if (typeof angle === 'undefined') { angle = -1.0; }

      /**
       * @property x
       * @type {number}
       */
      this.x = x;
      /**
       * @property y
       * @type {number}
       */
      this.y = y;
      /**
       * @property score
       * @type {number}
       */
      this.score = score;
      /**
       * @property level
       * @type {number}
       */
      this.level = level;
      /**
       * @property angle
       * @type {number}
       */
      this.angle = angle;

    }

    var p = Keypoint_t.prototype;
    p.constructor = Keypoint_t;

    return Keypoint_t;

  }() );

  global.Data_t = Data_t;
  global.Matrix_t = Matrix_t;
  global.Keypoint_t = Keypoint_t;

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/08 - 17:39
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
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  var
    Data_t = global.Data_t;

  // inner class
  var Node_t = ( function () {

    /**
     * Cache inner class
     * @class Node_t
     * @param {number} size_in_bytes
     * @constructor
     */
    function Node_t ( size_in_bytes ) {

      /**
       * @property next
       * @type {null|Node_t}
       */
      this.next = null;
      var data = new Data_t( size_in_bytes );
      /**
       * @property data
       * @type {Data_t|*}
       */
      this.data = data;
      /**
       * @property size
       * @type {number|*}
       */
      this.size = data.size;
      /**
       * @property buffer
       * @type {ArrayBuffer|*}
       */
      this.buffer = data.buffer;
      /**
       * @property u8
       * @type {Uint8Array}
       */
      this.u8 = data.u8;
      /**
       * @property i32
       * @type {Int32Array}
       */
      this.i32 = data.i32;
      /**
       * @property f32
       * @type {Float32Array}
       */
      this.f32 = data.f32;
      /**
       * @property f64
       * @type {Float64Array}
       */
      this.f64 = data.f64;

    }

    var p =  Node_t.prototype;
    p.constructor =  Node_t;

    /**
     * @property resize
     * @param {number} size_in_bytes
     */
    p.resize = function ( size_in_bytes ) {

      delete this.data;

      var data = new Data_t( size_in_bytes );
      this.data = data;
      this.size = data.size;
      this.buffer = data.buffer;
      this.u8 = data.u8;
      this.i32 = data.i32;
      this.f32 = data.f32;
      this.f64 = data.f64;

    };

    return  Node_t;

  }() );

  var Cache = ( function () {

    var
      _pool_head,
      _pool_tail;
    var _pool_size = 0;

    /**
     * has very simple and experimental linked pool based cache system. At the moment I'm not sure if it is really needed since most JavaScript engines have their own powerful caching. But running some tests I noticed that repeatedly calling methods that need temporary Array(s) allocation significantly increase its execution time. So replacing allocation with pooled buffers helps to improve performance in some cases. How it works:
     *
     *
     *      var size_in_bytes = 640;
     *      var temp_buffer =  Igata.Cache.getBuffer(size_in_bytes);
     *      var temp_u8 = temp_buffer.u8; // Uint8Array 640 entries
     *
     *      // but you also can get other data types
     *      // Int32Array but length will be 640/4 = 160 entries
     *      var temp_i32 = temp_buffer.i32;
     *
     *      // since all buffers comes from data_t instance
     *      // you can also use it to construct matrix_t
     *      var columns = 320, rows = 240, data_type = Igata.U8_t | Igata.C1_t;
     *      var my_matrix = new Igata.Matrix_t(columns, rows, data_type, temp_buffer.data);
     *
     *      // be careful because you always should provide enough space for matrix
     *
     *
     *
     * for now we dont need more than 30 buffers
     *
     * if having cache sys really helps we can add auto extending sys
     *
     *
     *       Cache.allocate(30, 640*4);
     *
     *
     * @class Cache
     * @static
     * @constructor
     */
    function Cache () {
      throw new Error( 'Cache can\'t create instance.' );
    }

    var p = Cache.prototype;
    p.constructor = Cache;

    /**
     * @method allocate
     * @static
     * @param {number} capacity
     * @param {number} data_size
     */
    Cache.allocate = function ( capacity, data_size ) {

      var
        node,
        i;

      _pool_head = _pool_tail = new Node_t(data_size);

      for ( i = 0; i < capacity; ++i ) {

        node = new Node_t(data_size);
        _pool_tail = _pool_tail.next = node;

        _pool_size++;

      }

    };

    /**
     * @method getBuffer
     * @static
     * @param {number} size_in_bytes
     * @return {*}
     */
    Cache.getBuffer = function ( size_in_bytes ) {

      // assume we have enough free nodes
      var node = _pool_head;

      _pool_head = _pool_head.next;
      _pool_size--;

      if( size_in_bytes > node.size ) {

        node.resize( size_in_bytes );

      }

      return node;

    };
    /**
     * @deprecated instead use getBuffer
     * @method get_buffer
     * @static
     * @param size_in_bytes
     * @return {*}
     */
    Cache.get_buffer = function ( size_in_bytes ) {

      return Cache.getBuffer( size_in_bytes );

    };
    /**
     * @method putBuffer
     * @static
     * @param {Node_t} node
     */
    Cache.putBuffer = function ( node ) {

      _pool_tail = _pool_tail.next = node;
      _pool_size++;

    };
    /**
     * @deprecated instead use putBuffer
     * @method put_buffer
     * @static
     * @param node
     */
    Cache.put_buffer = function ( node ) {

      Cache.putBuffer( node );

    };

    return Cache;

  }() );

  // for now we dont need more than 30 buffers
  // if having cache sys really helps we can add auto extending sys
  Cache.allocate(30, 640*4);

  global.Cache = Cache;

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/08 - 18:21
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
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    document = window.document,

    Igata = window.Igata,
    global = Igata;

  var Calc = ( function () {

    var qsort_stack = new Int32Array(48*2);
    var Cache = global.Cache;

    var
      U8_t = global.U8_t,
      S32_t = global.S32_t,
      F32_t = global.F32_t,
      S64_t = global.S64_t,
      F64_t = global.F64_t;

    /**
     * @class Calc
     * @static
     * @constructor
     */
    function Calc () {
      throw new Error( 'Calc can\'t create instance.' );
    }

    var p = Calc.prototype;
    p.constructor = Calc;

    /**
     * @method kernel
     * @static
     * @param {number} size
     * @param {number} sigma
     * @param {number} kernel
     * @param {number} data_type
     */
    Calc.kernel = function ( size, sigma, kernel, data_type ) {

      var i=0,x=0.0,t=0.0,sigma_x=0.0,scale_2x=0.0;
      var sum = 0.0;
      var kern_node = Cache.getBuffer(size<<2);
      var _kernel = kern_node.f32;//new Float32Array(size);

      if((size&1) === 1 && size <= 7 && sigma <= 0) {

        switch(size>>1) {

          case 0:
            _kernel[0] = 1.0;
            sum = 1.0;
            break;

          case 1:
            _kernel[0] = 0.25;
            _kernel[1] = 0.5;
            _kernel[2] = 0.25;
            sum = 0.25+0.5+0.25;
            break;

          case 2:
            _kernel[0] = 0.0625;
            _kernel[1] = 0.25;
            _kernel[2] = 0.375;
            _kernel[3] = 0.25;
            _kernel[4] = 0.0625;
            sum = 0.0625+0.25+0.375+0.25+0.0625;
            break;

          case 3:
            _kernel[0] = 0.03125;
            _kernel[1] = 0.109375;
            _kernel[2] = 0.21875;
            _kernel[3] = 0.28125;
            _kernel[4] = 0.21875;
            _kernel[5] = 0.109375;
            _kernel[6] = 0.03125;
            sum = 0.03125+0.109375+0.21875+0.28125+0.21875+0.109375+0.03125;
            break;

        }

      } else {

        sigma_x = sigma > 0 ? sigma : ((size-1)*0.5 - 1.0)*0.3 + 0.8;
        scale_2x = -0.5/(sigma_x*sigma_x);

        for( ; i < size; ++i ) {

          x = i - (size-1)*0.5;
          t = Math.exp(scale_2x*x*x);

          _kernel[i] = t;
          sum += t;

        }

      }

      if(data_type & U8_t) {

        // int based kernel
        sum = 256.0/sum;

        for (i = 0; i < size; ++i) {

          kernel[i] = (_kernel[i] * sum + 0.5)|0;

        }

      } else {

        // classic kernel
        sum = 1.0/sum;

        for (i = 0; i < size; ++i) {

          kernel[i] = _kernel[i] * sum;

        }

      }

      Cache.putBuffer(kern_node);

    };
    /**
     * @deprecated instead use kernel
     * @method get_gaussian_kernel
     * @static
     * @param size
     * @param sigma
     * @param kernel
     * @param data_type
     */
    Calc.get_gaussian_kernel = function ( size, sigma, kernel, data_type ) {

      Calc.kernel( size, sigma, kernel, data_type );

    };

    /**
     * @method perspective4
     * @static
     *
     * @param {number} model
     * @param {number} src_x0
     * @param {number} src_y0
     * @param {number} dst_x0
     * @param {number} dst_y0
     * @param {number} src_x1
     * @param {number} src_y1
     * @param {number} dst_x1
     * @param {number} dst_y1
     * @param {number} src_x2
     * @param {number} src_y2
     * @param {number} dst_x2
     * @param {number} dst_y2
     * @param {number} src_x3
     * @param {number} src_y3
     * @param {number} dst_x3
     * @param {number} dst_y3
     */
    Calc.perspective4 = function ( model, src_x0, src_y0, dst_x0, dst_y0,
                                                   src_x1, src_y1, dst_x1, dst_y1,
                                                   src_x2, src_y2, dst_x2, dst_y2,
                                                   src_x3, src_y3, dst_x3, dst_y3 ) {

      var t1 = src_x0;
      var t2 = src_x2;
      var t4 = src_y1;
      var t5 = t1 * t2 * t4;
      var t6 = src_y3;
      var t7 = t1 * t6;
      var t8 = t2 * t7;
      var t9 = src_y2;
      var t10 = t1 * t9;
      var t11 = src_x1;
      var t14 = src_y0;
      var t15 = src_x3;
      var t16 = t14 * t15;
      var t18 = t16 * t11;
      var t20 = t15 * t11 * t9;
      var t21 = t15 * t4;
      var t24 = t15 * t9;
      var t25 = t2 * t4;
      var t26 = t6 * t2;
      var t27 = t6 * t11;
      var t28 = t9 * t11;
      var t30 = 1.0 / (t21-t24 - t25 + t26 - t27 + t28);
      var t32 = t1 * t15;
      var t35 = t14 * t11;
      var t41 = t4 * t1;
      var t42 = t6 * t41;
      var t43 = t14 * t2;
      var t46 = t16 * t9;
      var t48 = t14 * t9 * t11;
      var t51 = t4 * t6 * t2;
      var t55 = t6 * t14;
      var Hr0 = -(t8-t5 + t10 * t11 - t11 * t7 - t16 * t2 + t18 - t20 + t21 * t2) * t30;
      var Hr1 = (t5 - t8 - t32 * t4 + t32 * t9 + t18 - t2 * t35 + t27 * t2 - t20) * t30;
      var Hr2 = t1;
      var Hr3 = (-t9 * t7 + t42 + t43 * t4 - t16 * t4 + t46 - t48 + t27 * t9 - t51) * t30;
      var Hr4 = (-t42 + t41 * t9 - t55 * t2 + t46 - t48 + t55 * t11 + t51 - t21 * t9) * t30;
      var Hr5 = t14;
      var Hr6 = (-t10 + t41 + t43 - t35 + t24 - t21 - t26 + t27) * t30;
      var Hr7 = (-t7 + t10 + t16 - t43 + t27 - t28 - t21 + t25) * t30;

      t1 = dst_x0;
      t2 = dst_x2;
      t4 = dst_y1;
      t5 = t1 * t2 * t4;
      t6 = dst_y3;
      t7 = t1 * t6;
      t8 = t2 * t7;
      t9 = dst_y2;
      t10 = t1 * t9;
      t11 = dst_x1;
      t14 = dst_y0;
      t15 = dst_x3;
      t16 = t14 * t15;
      t18 = t16 * t11;
      t20 = t15 * t11 * t9;
      t21 = t15 * t4;
      t24 = t15 * t9;
      t25 = t2 * t4;
      t26 = t6 * t2;
      t27 = t6 * t11;
      t28 = t9 * t11;
      t30 = 1.0 / (t21-t24 - t25 + t26 - t27 + t28);
      t32 = t1 * t15;
      t35 = t14 * t11;
      t41 = t4 * t1;
      t42 = t6 * t41;
      t43 = t14 * t2;
      t46 = t16 * t9;
      t48 = t14 * t9 * t11;
      t51 = t4 * t6 * t2;
      t55 = t6 * t14;
      var Hl0 = -(t8-t5 + t10 * t11 - t11 * t7 - t16 * t2 + t18 - t20 + t21 * t2) * t30;
      var Hl1 = (t5 - t8 - t32 * t4 + t32 * t9 + t18 - t2 * t35 + t27 * t2 - t20) * t30;
      var Hl2 = t1;
      var Hl3 = (-t9 * t7 + t42 + t43 * t4 - t16 * t4 + t46 - t48 + t27 * t9 - t51) * t30;
      var Hl4 = (-t42 + t41 * t9 - t55 * t2 + t46 - t48 + t55 * t11 + t51 - t21 * t9) * t30;
      var Hl5 = t14;
      var Hl6 = (-t10 + t41 + t43 - t35 + t24 - t21 - t26 + t27) * t30;
      var Hl7 = (-t7 + t10 + t16 - t43 + t27 - t28 - t21 + t25) * t30;

      // the following code computes R = Hl * inverse Hr
      t2 = Hr4-Hr7*Hr5;
      t4 = Hr0*Hr4;
      t5 = Hr0*Hr5;
      t7 = Hr3*Hr1;
      t8 = Hr2*Hr3;
      t10 = Hr1*Hr6;
      var t12 = Hr2*Hr6;
      t15 = 1.0 / (t4-t5*Hr7-t7+t8*Hr7+t10*Hr5-t12*Hr4);
      t18 = -Hr3+Hr5*Hr6;
      var t23 = -Hr3*Hr7+Hr4*Hr6;
      t28 = -Hr1+Hr2*Hr7;
      var t31 = Hr0-t12;
      t35 = Hr0*Hr7-t10;
      t41 = -Hr1*Hr5+Hr2*Hr4;
      var t44 = t5-t8;
      var t47 = t4-t7;
      t48 = t2*t15;
      var t49 = t28*t15;
      var t50 = t41*t15;
      var mat = model.data;
      mat[0] = Hl0*t48+Hl1*(t18*t15)-Hl2*(t23*t15);
      mat[1] = Hl0*t49+Hl1*(t31*t15)-Hl2*(t35*t15);
      mat[2] = -Hl0*t50-Hl1*(t44*t15)+Hl2*(t47*t15);
      mat[3] = Hl3*t48+Hl4*(t18*t15)-Hl5*(t23*t15);
      mat[4] = Hl3*t49+Hl4*(t31*t15)-Hl5*(t35*t15);
      mat[5] = -Hl3*t50-Hl4*(t44*t15)+Hl5*(t47*t15);
      mat[6] = Hl6*t48+Hl7*(t18*t15)-t23*t15;
      mat[7] = Hl6*t49+Hl7*(t31*t15)-t35*t15;
      mat[8] = -Hl6*t50-Hl7*(t44*t15)+t47*t15;

    };
    /**
     * @deprecated instead use perspective4
     * @method perspective_4point_transform
     * @static
     * @param model
     * @param src_x0
     * @param src_y0
     * @param dst_x0
     * @param dst_y0
     * @param src_x1
     * @param src_y1
     * @param dst_x1
     * @param dst_y1
     * @param src_x2
     * @param src_y2
     * @param dst_x2
     * @param dst_y2
     * @param src_x3
     * @param src_y3
     * @param dst_x3
     * @param dst_y3
     */
    Calc.perspective_4point_transform = function ( model, src_x0, src_y0, dst_x0, dst_y0,
                                                   src_x1, src_y1, dst_x1, dst_y1,
                                                   src_x2, src_y2, dst_x2, dst_y2,
                                                   src_x3, src_y3, dst_x3, dst_y3 ) {

      Calc.perspective4( model, src_x0, src_y0, dst_x0, dst_y0,
        src_x1, src_y1, dst_x1, dst_y1,
        src_x2, src_y2, dst_x2, dst_y2,
        src_x3, src_y3, dst_x3, dst_y3 );

    };

    /**
     * The current implementation was derived from *BSD system qsort():
     *
     * Copyright (c) 1992, 1993
     *
     * The Regents of the University of California.  All rights reserved.
     *
     * @method qsort
     * @static
     * @param {Array} array
     * @param {number} low
     * @param {number} high
     * @param {Function} cmp
     */
    Calc.qsort = function ( array, low, high, cmp ) {

      var isort_thresh = 7;
      var t,ta,tb,tc;
      var sp = 0,left=0,right=0,i=0,n=0,m=0,ptr=0,ptr2=0,d=0;
      var left0=0,left1=0,right0=0,right1=0,pivot=0,a=0,b=0,c=0,swap_cnt=0;

      var stack = qsort_stack;

      if( (high-low+1) <= 1 ) { return; }

      stack[0] = low;
      stack[1] = high;

      while( sp >= 0 ) {

        left = stack[sp<<1];
        right = stack[(sp<<1)+1];
        sp--;

        for(;;) {

          n = (right - left) + 1;

          if( n <= isort_thresh ) {

            //insert_sort:
            for( ptr = left + 1; ptr <= right; ptr++ ) {

              for( ptr2 = ptr; ptr2 > left && cmp(array[ptr2],array[ptr2-1]); ptr2--) {

                t = array[ptr2];
                array[ptr2] = array[ptr2-1];
                array[ptr2-1] = t;

              }

            }

            break;

          } else {

            swap_cnt = 0;

            left0 = left;
            right0 = right;
            pivot = left + (n>>1);

            if( n > 40 ) {

              d = n >> 3;
              a = left;
              b = left + d;
              c = left + (d<<1);
              ta = array[a];
              tb = array[b];
              tc = array[c];
              left = cmp(ta, tb) ?
                      (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a)) :
                        (cmp(tc, tb) ? b :
                          (cmp(ta, tc) ? a : c));

              a = pivot - d;
              b = pivot;
              c = pivot + d;
              ta = array[a];
              tb = array[b];
              tc = array[c];
              pivot = cmp(ta, tb) ?
                        (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a)):
                          (cmp(tc, tb) ? b :
                            (cmp(ta, tc) ? a : c));

              a = right - (d<<1);
              b = right - d;
              c = right;
              ta = array[a];
              tb = array[b];
              tc = array[c];
              right = cmp(ta, tb) ?
                        (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a)) :
                          (cmp(tc, tb) ? b :
                            (cmp(ta, tc) ? a : c));
            }

            a = left;
            b = pivot;
            c = right;
            ta = array[a];
            tb = array[b];
            tc = array[c];
            pivot = cmp(ta, tb) ?
                      (cmp(tb, tc) ? b : (cmp(ta, tc) ? c : a)) :
                        (cmp(tc, tb) ? b :
                          (cmp(ta, tc) ? a : c));

            if( pivot !== left0 ) {

              t = array[pivot];
              array[pivot] = array[left0];
              array[left0] = t;
              pivot = left0;

            }

            left = left1 = left0 + 1;
            right = right1 = right0;

            ta = array[pivot];

            for(;;) {

              while( left <= right && !cmp(ta, array[left]) ) {

                if( !cmp(array[left], ta) ) {

                  if( left > left1 ) {

                    t = array[left1];
                    array[left1] = array[left];
                    array[left] = t;

                  }

                  swap_cnt = 1;
                  left1++;

                }

                left++;

              }

              while( left <= right && !cmp(array[right], ta) ) {

                if( !cmp(ta, array[right]) ) {

                  if( right < right1 ) {

                    t = array[right1];
                    array[right1] = array[right];
                    array[right] = t;

                  }

                  swap_cnt = 1;
                  right1--;

                }

                right--;

              }

              if( left > right ) { break; }

              t = array[left];
              array[left] = array[right];
              array[right] = t;
              swap_cnt = 1;
              left++;
              right--;

            }

            if( swap_cnt === 0 ) {

              left = left0;
              right = right0;

              //goto insert_sort;
              for( ptr = left + 1; ptr <= right; ptr++ ) {

                for( ptr2 = ptr; ptr2 > left && cmp(array[ptr2],array[ptr2-1]); ptr2--) {

                  t = array[ptr2];
                  array[ptr2] = array[ptr2-1];
                  array[ptr2-1] = t;

                }

              }

              break;

            }

            n = Math.min( (left1 - left0), (left - left1) );
            m = (left-n)|0;

            for( i = 0; i < n; ++i,++m ) {

              t = array[left0+i];
              array[left0+i] = array[m];
              array[m] = t;

            }

            n = Math.min( (right0 - right1), (right1 - right) );
            m = (right0-n+1)|0;

            for( i = 0; i < n; ++i,++m ) {

              t = array[left+i];
              array[left+i] = array[m];
              array[m] = t;

            }

            n = (left - left1);
            m = (right1 - right);

            if( n > 1 ) {

              if( m > 1 ) {

                if( n > m ) {

                  ++sp;
                  stack[sp<<1] = left0;
                  stack[(sp<<1)+1] = left0 + n - 1;
                  left = right0 - m + 1;
                  right = right0;

                } else {

                  ++sp;
                  stack[sp<<1] = right0 - m + 1;
                  stack[(sp<<1)+1] = right0;
                  left = left0;
                  right = left0 + n - 1;

                }

              } else {

                left = left0;
                right = left0 + n - 1;

              }

            } else if( m > 1 ) {

              left = right0 - m + 1;
              right = right0;

            } else {

              break;

            }

          }

        }// for ;;

      }// while

    };

    /**
     * @method median
     * @static
     * @param {Array} array
     * @param {number} low
     * @param {number} high
     * @return {*}
     */
    Calc.median = function ( array, low, high ) {

      var w;
      var
        middle=0,
        ll=0,
        hh=0,
        median=(low+high)>>1;

      for (;;) {

        if (high <= low) { return array[median]; }

        if (high === (low + 1)) {

          if (array[low] > array[high]) {

            w = array[low];
            array[low] = array[high];
            array[high] = w;

          }

          return array[median];

        }

        middle = ((low + high) >> 1);

        if (array[middle] > array[high]) {

          w = array[middle];
          array[middle] = array[high];
          array[high] = w;

        }

        if (array[low] > array[high]) {

          w = array[low];
          array[low] = array[high];
          array[high] = w;

        }

        if (array[middle] > array[low]) {

          w = array[middle];
          array[middle] = array[low];
          array[low] = w;

        }

        ll = (low + 1);
        w = array[middle];
        array[middle] = array[ll];
        array[ll] = w;
        hh = high;

        for (;;) {

          do {++ll;} while (array[low] > array[ll]);
          do {--hh;} while (array[hh] > array[low]);

          if (hh < ll) { break; }

          w = array[ll];
          array[ll] = array[hh];
          array[hh] = w;

        }

        w = array[low];
        array[low] = array[hh];
        array[hh] = w;

        if (hh <= median) {

          low = ll;

        } else if (hh >= median) {

          high = (hh - 1);

        }

      }

      return 0;

    };

    return Calc;

  }() );

  global.Calc = Calc;

}( window ) );

///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/09 - 12:39
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
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  var MatrixMath = ( function () {

    /**
     * Matrix Math
     *
     * Various generalized matrix operations.
     *
     * @class MatrixMath
     * @static
     * @constructor
     */
    function MatrixMath () {
      throw new Error( 'MatrixMath can\'t create instance.' );
    }

    var p = MatrixMath.prototype;
    p.constructor = MatrixMath;

    /**
     * @method identity
     * @param {Matrix_t} M
     * @param {number=1} [value]
     */
    MatrixMath.identity = function ( M, value ) {

      if (typeof value === "undefined") { value=1; }

      var src=M.data;
      var rows=M.rows, cols=M.cols, cols_1=(cols+1)|0;
      var len = rows * cols;
      var k = len;

      while(--len >= 0) {

        src[len] = 0.0;

      }

      len = k;
      k = 0;

      while(k < len)  {

        src[k] = value;
        k = k + cols_1;

      }

    };

    /**
     * Transposes a matrix.
     *
     * @method transpose
     * @static
     * @param {Matrix_t} At
     * @param {Matrix_t} A
     */
    MatrixMath.transpose = function ( At, A ) {

      var i=0,j=0,nrows=A.rows,ncols=A.cols;
      var Ai=0,Ati=0,pAt=0;
      var ad=A.data,atd=At.data;

      for (; i < nrows; Ati += 1, Ai += ncols, i++) {

        pAt = Ati;

        for (j = 0; j < ncols; pAt += nrows, j++) {

          atd[pAt] = ad[Ai+j];

        }

      }

    };

    /**
     * Performs matrix multiplication.
     *
     * C = A * B
     *
     * @method multiply
     * @static
     * @param {Matrix_t} C
     * @param {Matrix_t} A
     * @param {Matrix_t} B
     */
    MatrixMath.multiply = function ( C, A, B ) {

      var i=0,j=0,k=0;
      var Ap=0,pA=0,pB=0,p_B=0,Cp=0;
      var ncols=A.cols,nrows=A.rows,mcols=B.cols;
      var ad=A.data,bd=B.data,cd=C.data;
      var sum=0.0;

      for (; i < nrows; Ap += ncols, i++) {

        for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {

          pB = p_B;
          pA = Ap;
          sum = 0.0;

          for (k = 0; k < ncols; pA++, pB += mcols, k++) {

            sum += ad[pA] * bd[pB];

          }

          cd[Cp] = sum;

        }

      }

    };
    /**
     * Post multiply the nrows x ncols matrix A by the transpose of the mrows x ncols matrix B to form the nrows x mrows matrix C, i.e. C = A*B'.
     *
     * C = A * B'
     *
     * @method multiply_ABt
     * @static
     * @param {Matrix_t} C
     * @param {Matrix_t} A
     * @param {Matrix_t} B
     */
    MatrixMath.multiply_ABt = function ( C, A, B ) {

      var i=0,j=0,k=0;
      var Ap=0,pA=0,pB=0,Cp=0;
      var ncols=A.cols,nrows=A.rows,mrows=B.rows;
      var ad=A.data,bd=B.data,cd=C.data;
      var sum=0.0;

      for (; i < nrows; Ap += ncols, i++) {

        for (pB = 0, j = 0; j < mrows; Cp++, j++) {

          pA = Ap;
          sum = 0.0;

          for (k = 0; k < ncols; pA++, pB++, k++) {

            sum += ad[pA] * bd[pB];

          }

          cd[Cp] = sum;

        }

      }

    };
    /**
     * Post multiply the transpose of the nrows x ncols matrix A by the nrows x mcols matrix B to form the ncols x mcols matrix C, i.e. C = A'*B.
     *
     * C = A' * B
     *
     * @method multiply_AtB
     * @static
     * @param {Matrix_t} C
     * @param {Matrix_t} A
     * @param {Matrix_t} B
     */
    MatrixMath.multiply_AtB = function ( C, A, B ) {

      var i=0,j=0,k=0;
      var Ap=0,pA=0,pB=0,p_B=0,Cp=0;
      var ncols=A.cols,nrows=A.rows,mcols=B.cols;
      var ad=A.data,bd=B.data,cd=C.data;
      var sum=0.0;

      for (; i < ncols; Ap++, i++) {

        for (p_B = 0, j = 0; j < mcols; Cp++, p_B++, j++) {

          pB = p_B;
          pA = Ap;
          sum = 0.0;

          for (k = 0; k < nrows; pA += ncols, pB += mcols, k++) {

            sum += ad[pA] * bd[pB];

          }

          cd[Cp] = sum;

        }

      }

    };

    /**
     * C = A * A'
     *
     * @method multiply_AAt
     * @static
     * @param {Matrix_t} C
     * @param {Matrix_t} A
     */
    MatrixMath.multiply_AAt = function ( C, A ) {

      var i=0,j=0,k=0;
      var pCdiag=0,p_A=0,pA=0,pB=0,pC=0,pCt=0;
      var ncols=A.cols,nrows=A.rows;
      var ad=A.data,cd=C.data;
      var sum=0.0;

      for (; i < nrows; pCdiag += nrows + 1, p_A = pA, i++) {

        pC = pCdiag;
        pCt = pCdiag;
        pB = p_A;

        for (j = i; j < nrows; pC++, pCt += nrows, j++) {

          pA = p_A;
          sum = 0.0;

          for (k = 0; k < ncols; k++) {

            sum += ad[pA++] * ad[pB++];

          }

          cd[pC] = sum;
          cd[pCt] = sum;

        }

      }

    };
    /**
     * C = A' * A
     *
     * @method multiply_AAt
     * @static
     * @param {Matrix_t} C
     * @param {Matrix_t} A
     */
    MatrixMath.multiply_AtA = function ( C, A ) {

      var i=0,j=0,k=0;
      var p_A=0,pA=0,pB=0,p_C=0,pC=0,p_CC=0;
      var ncols=A.cols,nrows=A.rows;
      var ad=A.data,cd=C.data;
      var sum=0.0;

      for (; i < ncols; p_C += ncols, i++) {

        p_A = i;
        p_CC = p_C + i;
        pC = p_CC;

        for (j = i; j < ncols; pC++, p_CC += ncols, j++) {

          pA = p_A;
          pB = j;
          sum = 0.0;

          for (k = 0; k < nrows; pA += ncols, pB += ncols, k++) {

            sum += ad[pA] * ad[pB];

          }

          cd[pC] = sum;
          cd[p_CC] = sum;

        }

      }

    };

    // --------------------------------------------------------------
    // 3x3
    /**
     * various small matrix operations
     *
     * @method identity_3x3
     * @static
     * @param {Matrix_t} M
     * @param {number=1} [value]
     */
    MatrixMath.identity_3x3 = function ( M, value ) {

      if (typeof value === "undefined") { value=1; }

      var dt=M.data;

      dt[0] = dt[4] = dt[8] = value;
      dt[1] = dt[2] = dt[3] = 0;
      dt[5] = dt[6] = dt[7] = 0;

    };
    /**
     * @method invert_3x3
     * @static
     * @param {Matrix_t} from
     * @param {Matrix_t} to
     */
    MatrixMath.invert_3x3 = function ( from, to ) {

      var A = from.data, invA = to.data;
      var t1 = A[4];
      var t2 = A[8];
      var t4 = A[5];
      var t5 = A[7];
      var t8 = A[0];

      var t9 = t8*t1;
      var t11 = t8*t4;
      var t13 = A[3];
      var t14 = A[1];
      var t15 = t13*t14;
      var t17 = A[2];
      var t18 = t13*t17;
      var t20 = A[6];
      var t21 = t20*t14;
      var t23 = t20*t17;
      var t26 = 1.0/(t9*t2-t11*t5-t15*t2+t18*t5+t21*t4-t23*t1);

      invA[0] = (t1*t2-t4*t5)*t26;
      invA[1] = -(t14*t2-t17*t5)*t26;
      invA[2] = -(-t14*t4+t17*t1)*t26;
      invA[3] = -(t13*t2-t4*t20)*t26;
      invA[4] = (t8*t2-t23)*t26;
      invA[5] = -(t11-t18)*t26;
      invA[6] = -(-t13*t5+t1*t20)*t26;
      invA[7] = -(t8*t5-t21)*t26;
      invA[8] = (t9-t15)*t26;

    };

    /**
     * C = A * B
     *
     * @method multiply_3x3
     * @static
     * @param {Matrix_t} C
     * @param {Matrix_t} A
     * @param {Matrix_t} B
     */
    MatrixMath.multiply_3x3 = function ( C, A, B ) {

      var Cd=C.data, Ad=A.data, Bd=B.data;

      var m1_0 = Ad[0], m1_1 = Ad[1], m1_2 = Ad[2];
      var m1_3 = Ad[3], m1_4 = Ad[4], m1_5 = Ad[5];
      var m1_6 = Ad[6], m1_7 = Ad[7], m1_8 = Ad[8];

      var m2_0 = Bd[0], m2_1 = Bd[1], m2_2 = Bd[2];
      var m2_3 = Bd[3], m2_4 = Bd[4], m2_5 = Bd[5];
      var m2_6 = Bd[6], m2_7 = Bd[7], m2_8 = Bd[8];

      Cd[0] = m1_0 * m2_0 + m1_1 * m2_3 + m1_2 * m2_6;
      Cd[1] = m1_0 * m2_1 + m1_1 * m2_4 + m1_2 * m2_7;
      Cd[2] = m1_0 * m2_2 + m1_1 * m2_5 + m1_2 * m2_8;
      Cd[3] = m1_3 * m2_0 + m1_4 * m2_3 + m1_5 * m2_6;
      Cd[4] = m1_3 * m2_1 + m1_4 * m2_4 + m1_5 * m2_7;
      Cd[5] = m1_3 * m2_2 + m1_4 * m2_5 + m1_5 * m2_8;
      Cd[6] = m1_6 * m2_0 + m1_7 * m2_3 + m1_8 * m2_6;
      Cd[7] = m1_6 * m2_1 + m1_7 * m2_4 + m1_8 * m2_7;
      Cd[8] = m1_6 * m2_2 + m1_7 * m2_5 + m1_8 * m2_8;

    };
    /**
     * @method mat3x3_determinant
     * @static
     * @param {Matrix_t} M
     * @return {number}
     */
    MatrixMath.mat3x3_determinant = function ( M ) {

      var md=M.data;

      return  md[0] * md[4] * md[8] -
              md[0] * md[5] * md[7] -
              md[3] * md[1] * md[8] +
              md[3] * md[2] * md[7] +
              md[6] * md[1] * md[5] -
              md[6] * md[2] * md[4];

    };
    /**
     * @method determinant_3x3
     * @static
     * @param {number} M11
     * @param {number} M12
     * @param {number} M13
     * @param {number} M21
     * @param {number} M22
     * @param {number} M23
     * @param {number} M31
     * @param {number} M32
     * @param {number} M33
     * @return {number}
     */
    MatrixMath.determinant_3x3 = function ( M11, M12, M13, M21, M22, M23, M31, M32, M33 ) {

      return  M11 * M22 * M33 - M11 * M23 * M32 -
              M21 * M12 * M33 + M21 * M13 * M32 +
              M31 * M12 * M23 - M31 * M13 * M22;

    };

    return MatrixMath;

  }() );

  global.MatrixMath = MatrixMath;
  /**
   * alias MatrixMath
   *
   * @class MM
   * @uses MatrixMath
   */
  global.MM = MatrixMath;

}( window ) );

///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/09 - 13:23
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
/**
 * original code
 * http://inspirit.github.io/Igata/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  var Cache = global.Cache;
  var Matrix_t = global.Matrix_t;
  var MM = global.MM;

  // ---------------------------------------------------
  // private static method

  // swap
  /**
   * @for LinearAlgebra
   * @method swap
   * @private
   * @static
   *
   * @param {Matrix_t} A
   * @param {number} i0
   * @param {number} i1
   * @param {Matrix_t} [t]
   */
  function swap ( A, i0, i1, t ) {

    t = A[i0];
    A[i0] = A[i1];
    A[i1] = t;

  }

  /**
   * @for LinearAlgebra
   * @method hypot
   * @private
   * @static
   *
   * @param {number} a
   * @param {number} b
   * @return {number}
   */
  function hypot (a, b) {

    a = Math.abs(a);
    b = Math.abs(b);

    if (  a > b ) {

      b /= a;
      return a*Math.sqrt(1.0 + b*b);

    }

    if (  b > 0 ) {

      a /= b;
      return b*Math.sqrt(1.0 + a*a);

    }

    return 0.0;

  }

  // jacobiImpl
  /**
   * @for LinearAlgebra
   * @method jacobiImpl
   * @private
   * @static
   * 
   * @param {Matrix_t} A
   * @param {number} astep
   * @param {Matrix_t} W
   * @param {Matrix_t} V
   * @param {number} vstep
   * @param {number} n
   * @constructor
   */
  function jacobiImpl ( A, astep, W, V, vstep, n ) {

    var eps = Igata.EPSILON;
    var i=0,j=0,k=0,m=0,l=0,idx=0,_in=0,_in2=0;
    var iters=0,max_iter=n*n*30;
    var mv=0.0,val=0.0,p=0.0,y=0.0,t=0.0,s=0.0,c=0.0,a0=0.0,b0=0.0;

    var indR_buff = Cache.getBuffer(n<<2);
    var indC_buff = Cache.getBuffer(n<<2);
    var indR = indR_buff.i32;
    var indC = indC_buff.i32;

    if ( V) {

      for (; i < n; i++) {

        k = i*vstep;

        for (j = 0; j < n; j++) {

          V[k + j] = 0.0;

        }

        V[k + i] = 1.0;

      }

    }

    for (k = 0; k < n; k++) {

      W[k] = A[(astep + 1)*k];

      if ( k < n - 1) {

        for (m = k+1, mv = Math.abs(A[astep*k + m]), i = k+2; i < n; i++) {

          val = Math.abs(A[astep*k+i]);

          if ( mv < val){

            mv = val;
            m = i;

          }

        }

        indR[k] = m;

      }

      if ( k > 0) {

        for (m = 0, mv = Math.abs(A[k]), i = 1; i < k; i++) {

          val = Math.abs(A[astep*i+k]);

          if ( mv < val){

            mv = val;
            m = i;

          }

        }

        indC[k] = m;

      }

    }

    if ( n > 1) {

      for ( ; iters < max_iter; iters++) {

        // find index (k,l) of pivot p
        for (k = 0, mv = Math.abs(A[indR[0]]), i = 1; i < n-1; i++) {

          val = Math.abs(A[astep*i + indR[i]]);

          if (  mv < val ){

            mv = val;
            k = i;

          }

        }

        l = indR[k];

        for (i = 1; i < n; i++) {

          val = Math.abs(A[astep*indC[i] + i]);

          if (  mv < val ){

            mv = val;
            k = indC[i];
            l = i;

          }

        }

        p = A[astep*k + l];

        if ( Math.abs(p) <= eps ) {

          break;

        }

        y = (W[l] - W[k])*0.5;
        t = Math.abs(y) + hypot(p, y);
        s = hypot(p, t);
        c = t/s;
        s = p/s; t = (p/t)*p;

        if ( y < 0){

          s = -s;
          t = -t;

        }

        A[astep*k + l] = 0;

        W[k] -= t;
        W[l] += t;

        // rotate rows and columns k and l
        for (i = 0; i < k; i++) {

          _in = (astep * i + k);
          _in2 = (astep * i + l);
          a0 = A[_in];
          b0 = A[_in2];
          A[_in] = a0 * c - b0 * s;
          A[_in2] = a0 * s + b0 * c;

        }

        for (i = (k + 1); i < l; i++) {

          _in = (astep * k + i);
          _in2 = (astep * i + l);
          a0 = A[_in];
          b0 = A[_in2];
          A[_in] = a0 * c - b0 * s;
          A[_in2] = a0 * s + b0 * c;

        }

        i = l + 1;
        _in = (astep * k + i);
        _in2 = (astep * l + i);

        for (; i < n; i++, _in++, _in2++) {

          a0 = A[_in];
          b0 = A[_in2];
          A[_in] = a0 * c - b0 * s;
          A[_in2] = a0 * s + b0 * c;

        }

        // rotate eigenvectors
        if (V) {

          _in = vstep * k;
          _in2 = vstep * l;

          for (i = 0; i < n; i++, _in++, _in2++) {

            a0 = V[_in];
            b0 = V[_in2];
            V[_in] = a0 * c - b0 * s;
            V[_in2] = a0 * s + b0 * c;

          }

        }


        for (j = 0; j < 2; j++) {

          idx = j === 0 ? k : l;

          if ( idx < n - 1) {

            for (m = idx+1, mv = Math.abs(A[astep*idx + m]), i = idx+2; i < n; i++) {

              val = Math.abs(A[astep*idx+i]);

              if (  mv < val ){

                mv = val;
                m = i;

              }

            }

            indR[idx] = m;

          }

          if ( idx > 0) {

            for (m = 0, mv = Math.abs(A[idx]), i = 1; i < idx; i++) {

              val = Math.abs(A[astep*i+idx]);

              if (  mv < val ){

                mv = val;
                m = i;

              }

            }

            indC[idx] = m;

          }

        }

      }

    }// n > 1

    // sort eigenvalues & eigenvectors
    for (k = 0; k < n-1; k++) {

      m = k;

      for (i = k+1; i < n; i++) {

        if (W[m] < W[i]) {

          m = i;

        }

      }

      if ( k !== m) {

        swap(W, m, k, mv);

        if ( V) {

          for (i = 0; i < n; i++) {

            swap(V, vstep*m + i, vstep*k + i, mv);

          }

        }

      }

    }

    Cache.putBuffer( indR_buff );
    Cache.putBuffer( indC_buff );

  }

  // jacobiSVDImpl
  /**
   * @for LinearAlgebra
   * @method jacobiSVDImpl
   * @private
   * @static
   * 
   * @param {Matrix_t} At
   * @param {number} astep
   * @param {Matrix_t} _W
   * @param {Matrix_t} Vt
   * @param {number} vstep
   * @param {number} m
   * @param {number} n
   * @param {number} n1
   * @constructor
   */
  function jacobiSVDImpl ( At, astep, _W, Vt, vstep, m, n, n1 ) {

    var eps = Igata.EPSILON * 2.0;
    var minval = Igata.FLT_MIN;
    var i=0,j=0,k=0,iter=0,max_iter=Math.max(m, 30);
    var Ai=0,Aj=0,Vi=0,Vj=0,changed=0;
    var c=0.0, s=0.0, t=0.0;
    var t0=0.0,t1=0.0,sd=0.0,beta=0.0,gamma=0.0,delta=0.0,a=0.0,p=0.0,b=0.0;
    var seed = 0x1234;
    var val=0.0,val0=0.0,asum=0.0;

    var W_buff = Cache.getBuffer(n<<3);
    var W = W_buff.f64;

    for (; i < n; i++) {

      for (k = 0, sd = 0; k < m; k++) {

        t = At[i*astep + k];
        sd += t*t;

      }

      W[i] = sd;

      if (Vt) {

        for (k = 0; k < n; k++) {

          Vt[i*vstep + k] = 0;

        }

        Vt[i*vstep + i] = 1;

      }

    }

    for (; iter < max_iter; iter++) {
      changed = 0;

      for (i = 0; i < n-1; i++) {

        for (j = i+1; j < n; j++) {

          Ai = (i*astep)|0;
          Aj = (j*astep)|0;

          a = W[i];
          p = 0;
          b = W[j];

          k = 2;
          p += At[Ai]*At[Aj];
          p += At[Ai+1]*At[Aj+1];

          for (; k < m; k++) {

            p += At[Ai+k]*At[Aj+k];

          }

          if ( Math.abs(p) <= eps*Math.sqrt(a*b) ) {

            continue;

          }

          p *= 2.0;
          beta = a - b;
          gamma = hypot(p, beta);

          if ( beta < 0 ) {

            delta = (gamma - beta)*0.5;
            s = Math.sqrt(delta/gamma);
            c = (p/(gamma*s*2.0));

          } else {

            c = Math.sqrt((gamma + beta)/(gamma*2.0));
            s = (p/(gamma*c*2.0));

          }

          a=0.0;
          b=0.0;

          k = 2; // unroll
          t0 = c*At[Ai] + s*At[Aj];
          t1 = -s*At[Ai] + c*At[Aj];

          At[Ai] = t0;
          At[Aj] = t1;

          a += t0*t0;
          b += t1*t1;

          t0 = c*At[Ai+1] + s*At[Aj+1];
          t1 = -s*At[Ai+1] + c*At[Aj+1];
          At[Ai+1] = t0;
          At[Aj+1] = t1;

          a += t0*t0;
          b += t1*t1;

          for ( ; k < m; k++ ) {

            t0 = c*At[Ai+k] + s*At[Aj+k];
            t1 = -s*At[Ai+k] + c*At[Aj+k];
            At[Ai+k] = t0; At[Aj+k] = t1;

            a += t0*t0; b += t1*t1;

          }

          W[i] = a; W[j] = b;

          changed = 1;

          if ( Vt) {

            Vi = (i*vstep)|0;
            Vj = (j*vstep)|0;

            k = 2;
            t0 = c*Vt[Vi] + s*Vt[Vj];
            t1 = -s*Vt[Vi] + c*Vt[Vj];
            Vt[Vi] = t0;
            Vt[Vj] = t1;

            t0 = c*Vt[Vi+1] + s*Vt[Vj+1];
            t1 = -s*Vt[Vi+1] + c*Vt[Vj+1];
            Vt[Vi+1] = t0;
            Vt[Vj+1] = t1;

            for (; k < n; k++) {

              t0 = c*Vt[Vi+k] + s*Vt[Vj+k];
              t1 = -s*Vt[Vi+k] + c*Vt[Vj+k];
              Vt[Vi+k] = t0;
              Vt[Vj+k] = t1;

            }

          }

        }

      }

      if (changed === 0) {

        break;

      }

    }

    for (i = 0; i < n; i++) {

      for (k = 0, sd = 0; k < m; k++) {

        t = At[i*astep + k];
        sd += t*t;

      }

      W[i] = Math.sqrt(sd);

    }

    for (i = 0; i < n-1; i++) {

      j = i;

      for (k = i+1; k < n; k++) {

        if ( W[j] < W[k]){

          j = k;

        }

      }

      if ( i !== j) {

        swap(W, i, j, sd);

        if ( Vt) {

          for (k = 0; k < m; k++) {

            swap(At, i*astep + k, j*astep + k, t);

          }

          for (k = 0; k < n; k++) {

            swap(Vt, i*vstep + k, j*vstep + k, t);

          }

        }

      }

    }

    for (i = 0; i < n; i++) {

      _W[i] = W[i];

    }

    if ( !Vt) {

      Cache.putBuffer(W_buff);
      return;

    }

    for (i = 0; i < n1; i++) {

      sd = i < n ? W[i] : 0;

      while(sd <= minval) {

        // if we got a zero singular value, then in order to get the corresponding left singular vector
        // we generate a random vector, project it to the previously computed left singular vectors,
        // subtract the projection and normalize the difference.
        val0 = (1.0/m);

        for (k = 0; k < m; k++) {

          seed = (seed * 214013 + 2531011);
          val = (((seed >> 16) & 0x7fff) & 256) !== 0 ? val0 : -val0;
          At[i*astep + k] = val;

        }

        for (iter = 0; iter < 2; iter++) {

          for (j = 0; j < i; j++) {

            sd = 0;

            for (k = 0; k < m; k++) {

              sd += At[i*astep + k]*At[j*astep + k];

            }

            asum = 0.0;

            for (k = 0; k < m; k++) {

              t = (At[i*astep + k] - sd*At[j*astep + k]);
              At[i*astep + k] = t;
              asum += Math.abs(t);

            }

            asum = asum ? 1.0/asum : 0;

            for (k = 0; k < m; k++) {

              At[i*astep + k] *= asum;

            }

          }

        }

        sd = 0;

        for (k = 0; k < m; k++) {

          t = At[i*astep + k];
          sd += t*t;

        }

        sd = Math.sqrt(sd);

      }

      s = (1.0/sd);

      for (k = 0; k < m; k++) {

        At[i*astep + k] *= s;

      }

    }

    Cache.putBuffer(W_buff);

  }

  // ---------------------------------------------------
  // class
  var LinearAlgebra = ( function () {

    /**
     * @class LinearAlgebra
     * @static
     * @constructor
     */
    function LinearAlgebra () {
      throw new Error( 'LinearAlgebra can\'t create instance.' );
    }

    var p = LinearAlgebra.prototype;
    p.constructor = LinearAlgebra;

    /**
     * A and B modified and result output in B
     *
     * Solves the system of linear equations Ax = B using Cholesky factorization. The matrix must be symmetrical and positively defined. NOTE: input matrix_t instances will be modified and result output in matrix B.
     *
     * @method lu_solve
     * @static
     * @param {Matrix_t} A
     * @param {Matrix_t} B
     * @return {number}
     */
    LinearAlgebra.lu_solve = function ( A, B ) {

      var i=0,j=0,k=0,p=1,astep=A.cols;
      var ad=A.data, bd=B.data;
      var t,alpha,d,s;

      for (i = 0; i < astep; i++) {

        k = i;

        for (j = i+1; j < astep; j++) {

          if ( Math.abs(ad[j*astep + i]) > Math.abs(ad[k*astep+i])) {

            k = j;

          }

        }

        if (  Math.abs(ad[k*astep+i]) < Igata.EPSILON ) {

          // FAILED
          return 0;

        }

        if ( k !== i) {

          for (j = i; j < astep; j++ ) {

            swap(ad, i*astep+j, k*astep+j, t);

          }

          swap(bd, i, k, t);
          p = -p;

        }

        d = -1.0/ad[i*astep+i];

        for (j = i+1; j < astep; j++) {

          alpha = ad[j*astep+i]*d;

          for (k = i+1; k < astep; k++) {

            ad[j*astep+k] += alpha*ad[i*astep+k];

          }

          bd[j] += alpha*bd[i];

        }

        ad[i*astep+i] = -d;

      }

      for (i = astep-1; i >= 0; i--) {

        s = bd[i];

        for (k = i+1; k < astep; k++) {

          s -= ad[i*astep+k]*bd[k];

        }

        bd[i] = s*ad[i*astep+i];

      }

      // OK
      return 1;

    };
    /**
     * A and B modified and result output in B
     *
     * Solves the system of linear equations Ax = B using Cholesky factorization. The matrix must be symmetrical and positively defined. NOTE: input matrix_t instances will be modified and result output in matrix B.
     *
     * @method cholesky_solve
     * @static
     * @param {Matrix_t} A
     * @param {Matrix_t} B
     * @return {number}
     */
    LinearAlgebra.cholesky_solve = function ( A, B ) {

      var col=0,row=0,col2=0,cs=0,rs=0,i=0,j=0;
      var size = A.cols;
      var ad=A.data, bd=B.data;
      var val,inv_diag;

      for (col = 0; col < size; col++) {

        inv_diag = 1.0;
        cs = (col * size);
        rs = cs;

        for (row = col; row < size; row++) {

          // correct for the parts of cholesky already computed
          val = ad[(rs+col)];

          for (col2 = 0; col2 < col; col2++) {

            val -= ad[(col2*size+col)] * ad[(rs+col2)];

          }

          if (row === col) {
            // this is the diagonal element so don't divide
            ad[(rs+col)] = val;

            if ( val === 0) {

              return 0;

            }

            inv_diag = 1.0 / val;

          } else {

            // cache the value without division in the upper half
            ad[(cs+row)] = val;
            // divide my the diagonal element for all others
            ad[(rs+col)] = val * inv_diag;

          }

          rs = (rs + size);

        }

      }

      // first backsub through L
      cs = 0;

      for (i = 0; i < size; i++) {

        val = bd[i];

        for (j = 0; j < i; j++) {

          val -= ad[(cs+j)] * bd[j];

        }

        bd[i] = val;
        cs = (cs + size);

      }
      // backsub through diagonal
      cs = 0;

      for (i = 0; i < size; i++) {

        bd[i] /= ad[(cs + i)];
        cs = (cs + size);

      }

      // backsub through L Transpose
      i = (size-1);

      for (; i >= 0; i--) {

        val = bd[i];
        j = (i + 1);
        cs = (j * size);

        for (; j < size; j++) {

          val -= ad[(cs + i)] * bd[j];
          cs = (cs + size);

        }

        bd[i] = val;

      }

      return 1;

    };
    /**
     * This routine decomposes an rows x cols matrix A, into a product of the three matrices U, W, and V', i.e. A = UWV', where U is an rows x rows matrix whose columns are orthogonal, W is a 1 x cols matrix, and V is an cols x cols orthogonal matrix.
     *
     * @method svd_decompose
     * @static
     * @param {Matrix_t} A
     * @param {Matrix_t} W vector of singular values
     * @param {Matrix_t} U the left orthogonal matrix
     * @param {Matrix_t} V the right orthogonal matrix
     * @param {number=0} [options] Igata.SVD_U_T and/or Igata.SVD_V_T to return transposed U and/or V
     */
    LinearAlgebra.svd_decompose = function ( A, W, U, V, options ) {

      if (typeof options === "undefined") { options = 0; }

      var at=0,i=0,j=0,_m=A.rows,_n=A.cols,m=_m,n=_n;

      // we only work with single channel
      var dt = A.type | Igata.C1_t;

      if ( m < n) {

        at = 1;
        i = m;
        m = n;
        n = i;

      }

      var a_buff = Cache.getBuffer((m*m)<<3);
      var w_buff = Cache.getBuffer(n<<3);
      var v_buff = Cache.getBuffer((n*n)<<3);

      var a_mt = new Matrix_t(m, m, dt, a_buff.data);
      var w_mt = new Matrix_t(1, n, dt, w_buff.data);
      var v_mt = new Matrix_t(n, n, dt, v_buff.data);

      if ( at === 0) {
        // transpose
        MM.transpose(a_mt, A);

      } else {

        for (i = 0; i < _n*_m; i++) {

          a_mt.data[i] = A.data[i];

        }

        for (; i < n*m; i++) {

          a_mt.data[i] = 0;

        }

      }

      jacobiSVDImpl(a_mt.data, m, w_mt.data, v_mt.data, n, m, n, m);

      if ( W) {

        for (i=0; i < n; i++) {

          W.data[i] = w_mt.data[i];

        }

        for (; i < _n; i++) {

          W.data[i] = 0;

        }

      }

      if (at === 0) {

        if (U && (options & Igata.SVD_U_T)) {

          i = m*m;

          while(--i >= 0) {

            U.data[i] = a_mt.data[i];

          }

        } else if (U) {

          MM.transpose(U, a_mt);

        }

        if ( V && (options & Igata.SVD_V_T) ) {

          i = n*n;

          while(--i >= 0) {

            V.data[i] = v_mt.data[i];

          }

        } else if (V) {

          MM.transpose(V, v_mt);

        }

      } else {

        if ( U && (options & Igata.SVD_U_T)) {

          i = n*n;

          while(--i >= 0) {

            U.data[i] = v_mt.data[i];

          }

        } else if ( U) {

          MM.transpose(U, v_mt);

        }

        if (V && (options & Igata.SVD_V_T)) {

          i = m*m;

          while(--i >= 0) {

            V.data[i] = a_mt.data[i];

          }

        } else if (V) {

          MM.transpose(V, a_mt);

        }

      }

      Cache.putBuffer(a_buff);
      Cache.putBuffer(w_buff);
      Cache.putBuffer(v_buff);

    };
    /**
     * Solves the system of linear equations Ax = B using Singular value decomposition (SVD) method; the system can be over-defined and/or the matrix A can be singular.
     *
     * @method svd_solve
     * @static
     * @param {Matrix_t} A left-hand side of the system
     * @param {Matrix_t} X right-hand side of the system
     * @param {Matrix_t} B output solution
     */
    LinearAlgebra.svd_solve = function(A, X, B) {

      var i=0,j=0,k=0;
      var pu=0,pv=0;
      var nrows=A.rows,ncols=A.cols;
      var sum=0.0,xsum=0.0,tol=0.0;
      var dt = A.type | Igata.C1_t;

      var u_buff = Cache.getBuffer((nrows*nrows)<<3);
      var w_buff = Cache.getBuffer(ncols<<3);
      var v_buff = Cache.getBuffer((ncols*ncols)<<3);

      var u_mt = new Matrix_t(nrows, nrows, dt, u_buff.data);
      var w_mt = new Matrix_t(1, ncols, dt, w_buff.data);
      var v_mt = new Matrix_t(ncols, ncols, dt, v_buff.data);

      var bd = B.data, ud = u_mt.data, wd = w_mt.data, vd = v_mt.data;

      LinearAlgebra.svd_decompose(A, w_mt, u_mt, v_mt, 0);

      tol = Igata.EPSILON * wd[0] * ncols;

      for (; i < ncols; i++, pv += ncols) {

        xsum = 0.0;

        for (j = 0; j < ncols; j++) {

          if (wd[j] > tol) {

            for (k = 0, sum = 0.0, pu = 0; k < nrows; k++, pu += ncols) {

              sum += ud[pu + j] * bd[k];

            }

            xsum += sum * vd[pv + j] / wd[j];

          }

        }

        X.data[i] = xsum;

      }

      Cache.putBuffer(u_buff);
      Cache.putBuffer(w_buff);
      Cache.putBuffer(v_buff);

    };

    /**
     * @method svd_invert
     * @static
     * @param {Matrix_t} Ai
     * @param {Matrix_t} A
     */
    LinearAlgebra.svd_invert = function (Ai, A) {
      
      var i=0,j=0,k=0;
      var pu=0,pv=0,pa=0;
      var nrows=A.rows,ncols=A.cols;
      var sum=0.0,tol=0.0;
      var dt = A.type | Igata.C1_t;

      var u_buff = Cache.getBuffer((nrows*nrows)<<3);
      var w_buff = Cache.getBuffer(ncols<<3);
      var v_buff = Cache.getBuffer((ncols*ncols)<<3);

      var u_mt = new Matrix_t(nrows, nrows, dt, u_buff.data);
      var w_mt = new Matrix_t(1, ncols, dt, w_buff.data);
      var v_mt = new Matrix_t(ncols, ncols, dt, v_buff.data);

      var id = Ai.data, ud = u_mt.data, wd = w_mt.data, vd = v_mt.data;

      LinearAlgebra.svd_decompose(A, w_mt, u_mt, v_mt, 0);

      tol = Igata.EPSILON * wd[0] * ncols;

      for (; i < ncols; i++, pv += ncols) {

        for (j = 0, pu = 0; j < nrows; j++, pa++) {

          for (k = 0, sum = 0.0; k < ncols; k++, pu++) {

            if (wd[k] > tol) {

              sum += vd[pv + k] * ud[pu] / wd[k];

            }

          }

          id[pa] = sum;

        }

      }

      Cache.putBuffer(u_buff);
      Cache.putBuffer(w_buff);
      Cache.putBuffer(v_buff);

    };

    /**
     * Computes eigenvalues and eigenvectors of a symmetric matrix.
     *
     *      LinearAlgebra.eigenVV(A:matrix_t, EigenVectors:matrix_t, EigenValues:matrix_t);
     *
     *      // you can ask for Vectors or Values only
     *      LinearAlgebra.eigenVV(A:matrix_t, null, EigenValues:matrix_t);
     *
     *      LinearAlgebra.eigenVV(A:matrix_t, EigenVectors:matrix_t, null);
     *
     * @method eigenVV
     * @static
     * @param {Matrix_t} A
     * @param {Matrix_t} [vects]
     * @param {Matrix_t} [vals]
     */
    LinearAlgebra.eigenVV = function(A, vects, vals) {

      var n=A.cols,i=n*n;
      var dt = A.type | Igata.C1_t;

      var a_buff = Cache.getBuffer((n*n)<<3);
      var w_buff = Cache.getBuffer(n<<3);

      var a_mt = new Matrix_t(n, n, dt, a_buff.data);
      var w_mt = new Matrix_t(1, n, dt, w_buff.data);

      while(--i >= 0) {

        a_mt.data[i] = A.data[i];

      }

      jacobiImpl(a_mt.data, n, w_mt.data, vects ? vects.data : null, n, n);

      if ( vals) {

        while(--n >= 0) {

          vals.data[n] = w_mt.data[n];

        }

      }

      Cache.putBuffer(a_buff);
      Cache.putBuffer(w_buff);

    };

    return LinearAlgebra;

  }() );

  global.LinearAlgebra = LinearAlgebra;
  /**
   * alias LinearAlgebra
   *
   * @class LA
   * @uses LinearAlgebra
   */
  global.LA = LinearAlgebra;

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/09 - 15:15
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
/**
 * original code
 * http://inspirit.github.io/Igata/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  var Cache = global.Cache;
  var Matrix_t = global.Matrix_t;
  var MM = global.MM;
  var LA = global.LA;
  var Calc = global.Calc;

  var F32_t = global.F32_t;
  var C1_t = global.C1_t;
  var EPSILON = global.EPSILON;

  // private const
  var T0  = new Matrix_t( 3, 3, F32_t|C1_t);
  var T1  = new Matrix_t( 3, 3, F32_t|C1_t);
  var AtA = new Matrix_t( 6, 6, F32_t|C1_t);
  var AtB = new Matrix_t( 6, 1, F32_t|C1_t);

  var mLtL = new Matrix_t(9, 9, F32_t|C1_t);
  var Evec = new Matrix_t(9, 9, F32_t|C1_t);

  // ---------------------------------------------------
  // private static method
  //function sqr (x) {
  //
  //  return x*x;
  //
  //}



  // HomeGraphy2d.checkSubset で使用痕跡あり
  // seems to reject good subsets actually
  // で使われなくなった様子
  //
  //function have_collinear_points ( points, count ) {
  //
  //  var j=0,k=0,i=(count-1)|0;
  //  var dx1=0.0,dy1=0.0,dx2=0.0,dy2=0.0;
  //
  //  // check that the i-th selected point does not belong
  //  // to a line connecting some previously selected points
  //  for(; j < i; ++j) {
  //
  //    dx1 = points[j].x - points[i].x;
  //    dy1 = points[j].y - points[i].y;
  //
  //    for(k = 0; k < j; ++k) {
  //
  //      dx2 = points[k].x - points[i].x;
  //      dy2 = points[k].y - points[i].y;
  //
  //      if( Math.abs(dx2*dy1 - dy2*dx1) <= EPSILON*(Math.abs(dx1) + Math.abs(dy1) + Math.abs(dx2) + Math.abs(dy2))) {
  //
  //        return true;
  //
  //      }
  //
  //    }
  //
  //  }
  //
  //  return false;
  //
  //}

  // ---------------------------------------------------
  // classes

  var Affine2d = ( function () {

    /**
     * does isotropic normalization
     *
     * @for Affine2d
     * @method iso_normalize_points
     * @private
     * @static
     *
     * @param {Matrix_t} from
     * @param {Matrix_t} to
     * @param {Matrix_t} T0
     * @param {Matrix_t} T1
     * @param {number} count
     */
    function iso_normalize_points ( from, to, T0, T1, count ) {

      var i=0;
      var cx0=0.0, cy0=0.0, d0=0.0, s0=0.0;
      var cx1=0.0, cy1=0.0, d1=0.0, s1=0.0;
      var dx=0.0,dy=0.0;

      for (; i < count; ++i) {

        cx0 += from[i].x;
        cy0 += from[i].y;
        cx1 += to[i].x;
        cy1 += to[i].y;

      }

      cx0 /= count;
      cy0 /= count;
      cx1 /= count;
      cy1 /= count;

      for (i = 0; i < count; ++i) {

        dx = from[i].x - cx0;
        dy = from[i].y - cy0;
        d0 += Math.sqrt(dx*dx + dy*dy);
        dx = to[i].x - cx1;
        dy = to[i].y - cy1;
        d1 += Math.sqrt(dx*dx + dy*dy);

      }

      d0 /= count;
      d1 /= count;

      s0 = Math.SQRT2 / d0;
      s1 = Math.SQRT2 / d1;

      T0[0] = T0[4] = s0;
      T0[2] = -cx0*s0;
      T0[5] = -cy0*s0;
      T0[1] = T0[3] = T0[6] = T0[7] = 0.0;
      T0[8] = 1.0;

      T1[0] = T1[4] = s1;
      T1[2] = -cx1*s1;
      T1[5] = -cy1*s1;
      T1[1] = T1[3] = T1[6] = T1[7] = 0.0;
      T1[8] = 1.0;

    }

    /**
     * This kernel calculates the affine transform from corresponding points. The function calculates the 3x3 Matrix
     *
     *
     *      // create affine kernel
     *      // you can reuse it for different point sets
     *      var affine_kernel = new Affine2d();
     *      var affine_transform = new Matrix_t(3, 3, Igata.F32_t | Igata.C1_t);
     *      var count = 33;
     *      var from = [];
     *      var to = [];
     *
     *      for(var i = 0; i < count; ++i) {
     *
     *        // you can use keypoint_t structure
     *        // or just provide object with x and y properties
     *        from[i] = { "x":Math.random()*320, "y":Math.random()*240 };
     *        to[i] = { "x":from[i].x + 5, "y":from[i].y+5 };
     *
     *      }
     *
     *      affine_kernel.run(from, to, affine_transform, count);
     *
     *      // you can also calculate transform error for each point
     *      var error = new Matrix_t(count, 1, jsfeat.F32_t | jsfeat.C1_t);
     *      affine_kernel.error(from, to, affine_transform, error.data, count);
     *
     *
     * @class Affine2d
     * @constructor
     */
    function Affine2d () {
      // empty constructor
    }

    var p = Affine2d.prototype;
    p.constructor = Affine2d;

    /**
     * @method run
     * @param {Matrix_t} from
     * @param {Matrix_t} to
     * @param {Matrix_t} model
     * @param {number} count
     * @return {number}
     */
    p.run = function ( from, to, model, count ) {

      var i=0,j=0;
      var dt=model.type|C1_t;
      var md=model.data, t0d=T0.data, t1d=T1.data;
      var pt0,pt1,px=0.0,py=0.0;

      iso_normalize_points(from, to, t0d, t1d, count);

      var a_buff = Cache.getBuffer((2*count*6)<<3);
      var b_buff = Cache.getBuffer((2*count)<<3);

      var a_mt = new Matrix_t(6, 2*count, dt, a_buff.data);
      var b_mt = new Matrix_t(1, 2*count, dt, b_buff.data);
      var ad=a_mt.data, bd=b_mt.data;

      for (; i < count; ++i) {
        
        pt0 = from[i];
        pt1 = to[i];

        px = t0d[0]*pt0.x + t0d[1]*pt0.y + t0d[2];
        py = t0d[3]*pt0.x + t0d[4]*pt0.y + t0d[5];

        j = i*2*6;
        ad[j]=px;
        ad[j+1]=py;
        ad[j+2]=1.0;
        ad[j+3]=0.0;
        ad[j+4]=0.0;
        ad[j+5]=0.0;

        j += 6;
        ad[j]=0.0;
        ad[j+1]=0.0;
        ad[j+2]=0.0;
        ad[j+3]=px;
        ad[j+4]=py;
        ad[j+5]=1.0;

        bd[i<<1] = t1d[0]*pt1.x + t1d[1]*pt1.y + t1d[2];
        bd[(i<<1)+1] = t1d[3]*pt1.x + t1d[4]*pt1.y + t1d[5];
        
      }

      MM.multiply_AtA(AtA, a_mt);
      MM.multiply_AtB(AtB, a_mt, b_mt);

      LA.lu_solve(AtA, AtB);

      md[0] = AtB.data[0];
      md[1]=AtB.data[1];
      md[2]=AtB.data[2];

      md[3] = AtB.data[3];
      md[4]=AtB.data[4];
      md[5]=AtB.data[5];

      md[6] = 0.0;
      md[7] = 0.0;
      md[8] = 1.0; // fill last row

      // de normalize
      MM.invert_3x3(T1, T1);
      MM.multiply_3x3(model, T1, model);
      MM.multiply_3x3(model, model, T0);

      // free buffer
      Cache.putBuffer(a_buff);
      Cache.putBuffer(b_buff);

      return 1;
      
    };

    return Affine2d;

  }() );

  // homo graphy 2d
  var HomoGraphy2d = ( function () {

    /**
     * This kernel calculates perspective transform between point sets. Result is 3x3 Matrix
     *
     *
     *      // create homography kernel
     *      // you can reuse it for different point sets
     *      var homo_kernel = new HomoGraphy2d();
     *      var homo_transform = new Matrix_t(3, 3, jsfeat.F32_t | jsfeat.C1_t);
     *      var count = 33;
     *      var from = [];
     *      var to = [];
     *
     *      for(var i = 0; i < count; ++i) {
     *
     *        // you can use keypoint_t structure
     *        // or just provide object with x and y properties
     *        from[i] = { "x":Math.random()*320, "y":Math.random()*240 };
     *        to[i] = { "x":from[i].x + 5, "y":from[i].y+5 };
     *
     *      }
     *
     *      homo_kernel.run(from, to, homo_transform, count);
     *
     *      // you can also calculate transform error for each point
     *      var error = new Matrix_t(count, 1, F32_t | C1_t);
     *      homo_kernel.error(from, to, homo_transform, error.data, count);
     *
     *
     * @class HomoGraphy2d
     * @constructor
     */
    function HomoGraphy2d () {
      // empty constructor
      //this.T0 = new Matrix_t(3, 3, F32_t|C1_t);
      //this.T1 = new Matrix_t(3, 3, F32_t|C1_t);
      //this.mLtL = new Matrix_t(9, 9, F32_t|C1_t);
      //this.Evec = new Matrix_t(9, 9, F32_t|C1_t);
    }

    var p = HomoGraphy2d.prototype;
    p.constructor = HomoGraphy2d;

    /**
     * @method run
     *
     * @param {Matrix_t} from
     * @param {Matrix_t} to
     * @param {Matrix_t} model
     * @param {number} count
     * @return {number}
     */
    p.run = function ( from, to, model, count ) {

      var i=0,j=0;
      var md=model.data, t0d=T0.data, t1d=T1.data;
      var LtL=mLtL.data, evd=Evec.data;
      var x=0.0,y=0.0,X=0.0,Y=0.0;

      // norm
      var smx=0.0, smy=0.0, cmx=0.0, cmy=0.0, sMx=0.0, sMy=0.0, cMx=0.0, cMy=0.0;

      for(; i < count; ++i) {
        
        cmx += to[i].x;
        cmy += to[i].y;
        cMx += from[i].x;
        cMy += from[i].y;
        
      }

      cmx /= count; 
      cmy /= count;
      cMx /= count; 
      cMy /= count;

      for (i = 0; i < count; ++i) {
        
        smx += Math.abs(to[i].x - cmx);
        smy += Math.abs(to[i].y - cmy);
        sMx += Math.abs(from[i].x - cMx);
        sMy += Math.abs(from[i].y - cMy);
        
      }

      if ( Math.abs(smx) < EPSILON || 
           Math.abs(smy) < EPSILON ||
           Math.abs(sMx) < EPSILON ||
           Math.abs(sMy) < EPSILON ) {
        
        return 0;
      
      }

      smx = count/smx; 
      smy = count/smy;
      sMx = count/sMx; 
      sMy = count/sMy;

      t0d[0] = sMx;
      t0d[1] = 0;
      t0d[2] = -cMx*sMx;
      t0d[3] = 0;
      t0d[4] = sMy;
      t0d[5] = -cMy*sMy;
      t0d[6] = 0;
      t0d[7] = 0;
      t0d[8] = 1;

      t1d[0] = 1.0/smx;
      t1d[1] = 0;
      t1d[2] = cmx;
      t1d[3] = 0;
      t1d[4] = 1.0/smy;
      t1d[5] = cmy;
      t1d[6] = 0;
      t1d[7] = 0;
      t1d[8] = 1;
      
      // construct system
      i = 81;
      while(--i >= 0) {
        
        LtL[i] = 0.0;
        
      }
      
      for ( i = 0; i < count; ++i ) {
        
        x = (to[i].x - cmx) * smx;
        y = (to[i].y - cmy) * smy;
        X = (from[i].x - cMx) * sMx;
        Y = (from[i].y - cMy) * sMy;

        LtL[0] += X*X;
        LtL[1] += X*Y;
        LtL[2] += X;

        LtL[6] += X*-x*X;
        LtL[7] += X*-x*Y;
        LtL[8] += X*-x;
        LtL[10] += Y*Y;
        LtL[11] += Y;

        LtL[15] += Y*-x*X;
        LtL[16] += Y*-x*Y;
        LtL[17] += Y*-x;
        LtL[20] += 1.0;

        LtL[24] += -x*X;
        LtL[25] += -x*Y;
        LtL[26] += -x;
        LtL[30] += X*X;
        LtL[31] += X*Y;
        LtL[32] += X;
        LtL[33] += X*-y*X;
        LtL[34] += X*-y*Y;
        LtL[35] += X*-y;
        LtL[40] += Y*Y;
        LtL[41] += Y;
        LtL[42] += Y*-y*X;
        LtL[43] += Y*-y*Y;
        LtL[44] += Y*-y;
        LtL[50] += 1.0;
        LtL[51] += -y*X;
        LtL[52] += -y*Y;
        LtL[53] += -y;
        LtL[60] += -x*X*-x*X + -y*X*-y*X;
        LtL[61] += -x*X*-x*Y + -y*X*-y*Y;
        LtL[62] += -x*X*-x + -y*X*-y;
        LtL[70] += -x*Y*-x*Y + -y*Y*-y*Y;
        LtL[71] += -x*Y*-x + -y*Y*-y;
        LtL[80] += -x*-x + -y*-y;
        
      }
      
      // symmetry
      for ( i = 0; i < 9; ++i ) {
        
        for ( j = 0; j < i; ++j ) {
          
          LtL[i*9+j] = LtL[j*9+i];
          
        }
        
      }

      LA.eigenVV(mLtL, Evec);

      md[0]=evd[72];
      md[1]=evd[73];
      md[2]=evd[74];
      md[3]=evd[75];
      md[4]=evd[76];
      md[5]=evd[77];
      md[6]=evd[78];
      md[7]=evd[79];
      md[8]=evd[80];

      // de normalize
      MM.multiply_3x3(model, T1, model);
      MM.multiply_3x3(model, model, T0);

      // set bottom right to 1.0
      x = 1.0/md[8];
      md[0] *= x; 
      md[1] *= x; 
      md[2] *= x;
      md[3] *= x; 
      md[4] *= x; 
      md[5] *= x;
      md[6] *= x; 
      md[7] *= x; 
      md[8] = 1.0;

      return 1;
      
    };

    /**
     * @method error
     * @param {Matrix_t} from
     * @param {Matrix_t} to
     * @param {Matrix_t} model
     * @param {Matrix_t} err
     * @param {number} count
     */
    p.error = function ( from, to, model, err, count ) {

      var i=0;
      var pt0,pt1,ww=0.0,dx=0.0,dy=0.0;
      var m=model.data;

      for (; i < count; ++i) {

        pt0 = from[i];
        pt1 = to[i];

        ww = 1.0/(m[6]*pt0.x + m[7]*pt0.y + 1.0);
        dx = (m[0]*pt0.x + m[1]*pt0.y + m[2])*ww - pt1.x;
        dy = (m[3]*pt0.x + m[4]*pt0.y + m[5])*ww - pt1.y;
        err[i] = (dx*dx + dy*dy);

      }

    };
    /**
     * @method checkSubset
     *
     * @param {Matrix_t} from
     * @param {Matrix_t} to
     * @param {number} count
     * @return {boolean}
     */
    p.checkSubset = function ( from, to, count ) {

      // seems to reject good subsets actually
      //if( have_collinear_points(from, count) || have_collinear_points(to, count) ) {
      //return false;
      //}
      if( count === 4 ) {

        var negative = 0;

        var fp0=from[0],fp1=from[1],fp2=from[2],fp3=from[3];
        var tp0=to[0],tp1=to[1],tp2=to[2],tp3=to[3];

        // set1
        var A11=fp0.x, A12=fp0.y, A13=1.0;
        var A21=fp1.x, A22=fp1.y, A23=1.0;
        var A31=fp2.x, A32=fp2.y, A33=1.0;

        var B11=tp0.x, B12=tp0.y, B13=1.0;
        var B21=tp1.x, B22=tp1.y, B23=1.0;
        var B31=tp2.x, B32=tp2.y, B33=1.0;

        var detA = MM.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
        var detB = MM.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

        if (detA*detB < 0) {

          negative++;

        }

        // set2
        A11=fp1.x;
        A12=fp1.y;
        A21=fp2.x;
        A22=fp2.y;
        A31=fp3.x;
        A32=fp3.y;

        B11=tp1.x;
        B12=tp1.y;
        B21=tp2.x;
        B22=tp2.y;
        B31=tp3.x;
        B32=tp3.y;

        detA = MM.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
        detB = MM.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

        if ( detA*detB < 0 ) {

          negative++;

        }

        // set3
        A11=fp0.x;
        A12=fp0.y;
        A21=fp2.x;
        A22=fp2.y;
        A31=fp3.x;
        A32=fp3.y;

        B11=tp0.x;
        B12=tp0.y;
        B21=tp2.x;
        B22=tp2.y;
        B31=tp3.x;
        B32=tp3.y;

        detA = MM.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
        detB = MM.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

        if(detA*detB < 0) {
          
          negative++;
        
        }

        // set4
        A11=fp0.x;
        A12=fp0.y;
        A21=fp1.x;
        A22=fp1.y;
        A31=fp3.x;
        A32=fp3.y;

        B11=tp0.x;
        B12=tp0.y;
        B21=tp1.x;
        B22=tp1.y;
        B31=tp3.x;
        B32=tp3.y;

        detA = MM.determinant_3x3(A11,A12,A13, A21,A22,A23, A31,A32,A33);
        detB = MM.determinant_3x3(B11,B12,B13, B21,B22,B23, B31,B32,B33);

        if ( detA*detB < 0 ) {

          negative++;

        }

        if ( negative !== 0 && negative !== -4 ) {

          return false;

        }

      }

      // all good
      return true;

    };
    /**
     * @deprecated instead use checkSubset
     * @method check_subset
     *
     * @param from
     * @param to
     * @param count
     */
    p.check_subset = function ( from, to, count ) {

      this.checkSubset( from, to, count );

    };

    return HomoGraphy2d;

  }() );

  // ransac_params_t
  var Ransac_t = ( function () {

    /**
     *
     * @class Ransac_t
     * @param {number=0} [size]
     * @param {number} [thresh]
     * @default 0.5
     * @param {number} [eps]
     * @default 0.5
     * @param {number} [prob]
     * @default 0.99
     * @constructor
     */
    function Ransac_t ( size, thresh, eps, prob ) {

      if (typeof size === "undefined") { size=0; }
      if (typeof thresh === "undefined") { thresh=0.5; }
      if (typeof eps === "undefined") { eps=0.5; }
      if (typeof prob === "undefined") { prob=0.99; }

      this.size = size;
      this.thresh = thresh;
      this.eps = eps;
      this.prob = prob;

    }

    var p = Ransac_t.prototype;
    p.constructor = Ransac_t;

    /**
     * @method update
     * @param {number} eps
     * @param {number} max_iters
     * @return {number}
     */
    p.update = function ( eps, max_iters ) {

      var num = Math.log(1 - this.prob);
      var denom = Math.log(1 - Math.pow(1 - eps, this.size));

      return (denom >= 0 || -num >= max_iters*(-denom) ? max_iters : Math.round(num/denom))|0;

    };

    /**
     * @deprecated instead use update
     * @method update_iters
     * @param _eps
     * @param max_iters
     * @return {number}
     */
    p.update_iters = function ( _eps, max_iters ) {

      return this.update( _eps, max_iters );

    };

    return Ransac_t;

  }() );

  // motion_estimator
  var MotionEstimator = ( function () {

    // private static methods
    /**
     * @for MotionEstimator
     * @method get_subset
     * @private
     * @static
     * @param kernel
     * @param from
     * @param to
     * @param need_cnt
     * @param max_cnt
     * @param from_sub
     * @param to_sub
     * @return {boolean}
     */
    function get_subset ( kernel, from, to, need_cnt, max_cnt, from_sub, to_sub ) {

      var max_try = 1000;
      var indices = [];
      var i=0, j=0, ssiter=0, idx_i=0, ok=false;

      for(; ssiter < max_try; ++ssiter)  {

        i = 0;

        for (; i < need_cnt && ssiter < max_try;) {

          ok = false;
          idx_i = 0;

          while (!ok) {

            ok = true;
            idx_i = indices[i] = Math.floor(Math.random() * max_cnt)|0;

            for (j = 0; j < i; ++j) {

              if (idx_i === indices[j]) {

                ok = false;
                break;

              }

            }

          }

          from_sub[i] = from[idx_i];
          to_sub[i] = to[idx_i];

          if( !kernel.check_subset( from_sub, to_sub, i+1 ) ) {

            ssiter++;
            continue;

          }

          ++i;

        }

        break;

      }

      return (i === need_cnt && ssiter < max_try);

    }// get_subset
    /**
     * @for MotionEstimator
     * @method find_inliers
     * @private
     * @static
     *
     * @param kernel
     * @param model
     * @param from
     * @param to
     * @param count
     * @param thresh
     * @param err
     * @param mask
     * @return {number}
     */
    function find_inliers ( kernel, model, from, to, count, thresh, err, mask ) {

      var numinliers = 0, i=0, f=0;
      var t = thresh*thresh;

      kernel.error(from, to, model, err, count);

      for(; i < count; ++i) {

        f = err[i] <= t;
        mask[i] = f;
        numinliers += f;

      }

      return numinliers;

    }// find_inliers
    /**
     * @class MotionEstimator
     * @static
     * @constructor
     */
    function MotionEstimator () {
      throw new Error( 'MotionEstimator can\'t create instance.' );
    }

    var p = MotionEstimator.prototype;
    p.constructor = MotionEstimator;
    /**
     * RANdom SAmple Consensus.
     *
     * [for more info see: http://en.wikipedia.org/wiki/RANSAC]
     *
     *
     *        // this class allows you to use above Motion Kernels
     *        // to estimate motion even with wrong correspondences
     *        var ransac = MotionEstimator.ransac;
     *
     *        // create homography kernel
     *        // you can reuse it for different point sets
     *        var homo_kernel = new HomoGraphy2d();
     *        var transform = new Matrix_t(3, 3, Igata.F32_t | Igata.C1_t);
     *        var count = 333;
     *        var from = [];
     *        var to = [];
     *
     *        for(var i = 0; i < count; ++i) {
     *
     *          // you can use keypoint_t structure
     *          // or just provide object with x and y properties
     *          from[i] = { "x":Math.random()*320, "y":Math.random()*240 };
     *          to[i] = { "x":from[i].x + Math.random()*5, "y":from[i].y+Math.random()*5 };
     *
     *        }
     *
     *        // each point will be marked as good(1) or bad(0)
     *        var mask = new Matrix_t(count, 1, Igata.U8_t | Igata.C1_t);
     *
     *        var model_size = 4; // minimum points to estimate motion
     *        var thresh = 3; // max error to classify as inlier
     *        var eps = 0.5; // max outliers ratio
     *        var prob = 0.99; // probability of success
     *        var params = new Ransac_t(model_size, thresh, eps, prob);
     *
     *        var max_iters = 1000;
     *        var ok = ransac(params, homo_kernel, from, to, count, transform, mask, max_iters);
     *
     *
     *
     * @method ransac
     * @static
     * @param {Ransac_t} params
     * @param {HomoGraphy2d} kernel
     * @param {Array} from
     * @param {Array} to
     * @param {number} count
     * @param {Matrix_t} model
     * @param {Matrix_t} mask
     * @param {number=1000} [max_iters]
     * @return {boolean}
     */
    MotionEstimator.ransac = function ( params, kernel, from, to, count, model, mask, max_iters ) {

      if (typeof max_iters === "undefined") { max_iters=1000; }

      if (count < params.size) { return false; }

      var model_points = params.size;
      var niters = max_iters, iter=0;
      var result = false;

      var subset0 = [];
      var subset1 = [];
      var found = false;

      var mc=model.cols,mr=model.rows;
      var dt = model.type | C1_t;

      var m_buff = Cache.getBuffer((mc*mr)<<3);
      var ms_buff = Cache.getBuffer(count);
      var err_buff = Cache.getBuffer(count<<2);
      var M = new Matrix_t(mc, mr, dt, m_buff.data);
      var curr_mask = new Matrix_t(count, 1, Igata.U8C1_t, ms_buff.data);

      var inliers_max = -1, numinliers=0;
      var nmodels = 0;

      var err = err_buff.f32;

      // special case
      if (count === model_points) {
        
        if (kernel.run(from, to, M, count) <= 0) {
          
          Cache.getBuffer(m_buff);
          Cache.getBuffer(ms_buff);
          Cache.getBuffer(err_buff);
          return false;
          
        }

        M.copy_to(model);
        
        if (mask) {
          
          while (--count >= 0) {
            
            mask.data[count] = 1;
            
          }
          
        }
        
        Cache.putBuffer(m_buff);
        Cache.putBuffer(ms_buff);
        Cache.putBuffer(err_buff);
        return true;
        
      }

      for (; iter < niters; ++iter) {
        
        // generate subset
        found = get_subset(kernel, from, to, model_points, count, subset0, subset1);
        
        if (!found) {
          
          if (iter === 0) {

            Cache.putBuffer(m_buff);
            Cache.putBuffer(ms_buff);
            Cache.putBuffer(err_buff);
            return false;
            
          }
          
          break;
          
        }

        nmodels = kernel.run( subset0, subset1, M, model_points );
        
        if (nmodels <= 0) {
          
          continue;
        
        }

        // TODO handle multimodel output

        numinliers = find_inliers(kernel, M, from, to, count, params.thresh, err, curr_mask.data);

        if ( numinliers > Math.max(inliers_max, model_points-1) ) {
          
          M.copy_to(model);
          inliers_max = numinliers;
          
          if (mask) {
            
            curr_mask.copy_to(mask);
            
          }
          
          //niters = params.update_iters((count - numinliers)/count, niters);
          niters = params.update((count - numinliers)/count, niters);
          result = true;
          
        }
        
      }

      Cache.putBuffer(m_buff);
      Cache.putBuffer(ms_buff);
      Cache.putBuffer(err_buff);

      return result;

    };

    /**
     * Least Median of Squares. Similar to above algorithm but uses median error value to filter wrong matches.
     *
     *
     *        // this class allows you to use above Motion Kernels
     *        // to estimate motion even with wrong correspondences
     *        var lmeds = MotionEstimator.lmeds;
     *
     *        // create homography kernel
     *        // you can reuse it for different point sets
     *        var affine_kernel = new Affine2d();
     *        var transform = new Matrix_t(3, 3, Igata.F32_t | Igata.C1_t);
     *        var count = 333;
     *        var from = [];
     *        var to = [];
     *
     *        for(var i = 0; i < count; ++i) {
     *
     *          // you can use keypoint_t structure
     *          // or just provide object with x and y properties
     *          from[i] = { "x":Math.random()*320, "y":Math.random()*240 };
     *          to[i] = { "x":from[i].x + Math.random()*5, "y":from[i].y+Math.random()*5 };
     *
     *        }
     *
     *        // each point will be marked as good(1) or bad(0)
     *        var mask = new Matrix_t(count, 1, Igata.U8_t | Igata.C1_t);
     *
     *        var model_size = 3; // minimum points to estimate motion
     *        var thresh = 0; // is not used in lmeds
     *        var eps = 0.45; // hard coded internally
     *        var prob = 0.99; // probability of success
     *        var params = new Ransac_t(model_size, thresh, eps, prob);
     *
     *        var max_iters = 1000;
     *
     *        var ok = lmeds(params, affine_kernel, from, to, count, transform, mask, max_iters);
     *
     *
     *
     * @method lmeds
     * @static
     * @param {Ransac_t} params
     * @param {Affine2d} kernel
     * @param {Array} from
     * @param {Array} to
     * @param {number} count
     * @param {Matrix_t} model
     * @param {Matrix_t} mask
     * @param {number=1000} [max_iters]
     * @return {boolean}
     */
    MotionEstimator.lmeds = function(params, kernel, from, to, count, model, mask, max_iters) {
      
      if (typeof max_iters === "undefined") { max_iters=1000; }

      if(count < params.size) {return false;}

      var model_points = params.size;
      var niters = max_iters, iter=0;
      var result = false;

      var subset0 = [];
      var subset1 = [];
      var found = false;

      var mc=model.cols,mr=model.rows;
      var dt = model.type | C1_t;

      var m_buff = Cache.getBuffer((mc*mr)<<3);
      var ms_buff = Cache.getBuffer(count);
      var err_buff = Cache.getBuffer(count<<2);
      var M = new Matrix_t(mc, mr, dt, m_buff.data);
      var curr_mask = new Matrix_t(count, 1, Igata.U8_t|C1_t, ms_buff.data);

      var numinliers=0;
      var nmodels = 0;

      var err = err_buff.f32;
      var min_median = 1000000000.0, sigma=0.0, median=0.0;

      params.eps = 0.45;
      niters = params.update_iters(params.eps, niters);

      // special case
      if (count === model_points) {
        
        if (kernel.run(from, to, M, count) <= 0) {
          
          Cache.putBuffer(m_buff);
          Cache.putBuffer(ms_buff);
          Cache.putBuffer(err_buff);
          return false;
          
        }

        M.copy_to(model);
        if(mask) {

          while(--count >= 0) {

            mask.data[count] = 1;

          }

        }

        Cache.putBuffer(m_buff);
        Cache.putBuffer(ms_buff);
        Cache.putBuffer(err_buff);

        return true;

      }

      for (; iter < niters; ++iter) {

        // generate subset
        found = get_subset(kernel, from, to, model_points, count, subset0, subset1);

        if(!found) {

          if(iter === 0) {

            Cache.putBuffer(m_buff);
            Cache.putBuffer(ms_buff);
            Cache.putBuffer(err_buff);
            return false;

          }

          break;

        }

        nmodels = kernel.run( subset0, subset1, M, model_points );

        if (nmodels <= 0) {

          continue;

        }

        // TODO handle multimodel output

        kernel.error(from, to, M, err, count);
        median = Calc.median(err, 0, count-1);

        if(median < min_median) {

          min_median = median;
          M.copy_to(model);
          result = true;

        }

      }

      if(result) {

        sigma = 2.5*1.4826*(1 + 5.0/(count - model_points))*Math.sqrt(min_median);
        sigma = Math.max(sigma, 0.001);

        numinliers = find_inliers(kernel, model, from, to, count, sigma, err, curr_mask.data);
        if (mask) { curr_mask.copy_to(mask); }

        result = numinliers >= model_points;

      }

      Cache.putBuffer(m_buff);
      Cache.putBuffer(ms_buff);
      Cache.putBuffer(err_buff);

      return result;

    };

    return MotionEstimator;

  }() );

  global.Affine2d = Affine2d;
  global.HomoGraphy2d = HomoGraphy2d;
  global.Ransac_t = Ransac_t;
  global.MotionEstimator = MotionEstimator;
  /**
   * alias MotionEstimator
   *
   * @class Estimator
   * @uses MotionEstimator
   */
  global.Estimator = MotionEstimator;

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/08 - 14:16
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
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;
  
  var Cache = global.Cache;
  var Calc = global.Calc;
  var Matrix_t = global.Matrix_t;

  var COLOR_RGBA2GRAY = global.COLOR_RGBA2GRAY;
  var COLOR_BGRA2GRAY = global.COLOR_BGRA2GRAY;
  var COLOR_BGR2GRAY = global.COLOR_BGR2GRAY;
  var COLOR_RGB2GRAY = global.COLOR_RGB2GRAY;

  var BOX_BLUR_NOSCALE = global.BOX_BLUR_NOSCALE;

  var
    U8_t = global.U8_t,
    S32_t = global.S32_t;


  function _resample_u8 (src, dst, nw, nh) {
    var xofs_count=0;
    var ch=src.channel,w=src.cols,h=src.rows;
    var src_d=src.data,dst_d=dst.data;
    var scale_x = w / nw, scale_y = h / nh;
    var inv_scale_256 = (scale_x * scale_y * 0x10000)|0;
    var
      dx=0,
      dy=0,
      sx=0,
      sy=0,
      sx1=0,sx2=0,i=0,k=0,fsx1=0.0,fsx2=0.0;
    var
      a=0,b=0,dxn=0,alpha=0,beta=0,beta1=0;

    var buf_node = Cache.getBuffer((nw*ch)<<2);
    var sum_node = Cache.getBuffer((nw*ch)<<2);
    var xofs_node = Cache.getBuffer((w*2*3)<<2);

    var buf = buf_node.i32;
    var sum = sum_node.i32;
    var xofs = xofs_node.i32;

    for (; dx < nw; dx++) {

      fsx1 = dx * scale_x;
      fsx2 = fsx1 + scale_x;

      sx1 = (fsx1 + 1.0 - 1e-6)|0;
      sx2 = fsx2|0;

      sx1 = Math.min(sx1, w - 1);
      sx2 = Math.min(sx2, w - 1);

      if(sx1 > fsx1) {

        xofs[k++] = (dx * ch)|0;
        xofs[k++] = ((sx1 - 1)*ch)|0;
        xofs[k++] = ((sx1 - fsx1) * 0x100)|0;
        xofs_count++;

      }

      for(sx = sx1; sx < sx2; sx++){

        xofs_count++;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = (sx * ch)|0;
        xofs[k++] = 256;

      }
      if(fsx2 - sx2 > 1e-3) {

        xofs_count++;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = (sx2 * ch)|0;
        xofs[k++] = ((fsx2 - sx2) * 256)|0;

      }

    }

    for (dx = 0; dx < nw * ch; dx++) {

      buf[dx] = sum[dx] = 0;

    }

    dy = 0;

    for (sy = 0; sy < h; sy++) {

      a = w * sy;

      for (k = 0; k < xofs_count; k++) {

        dxn = xofs[k*3];
        sx1 = xofs[k*3+1];
        alpha = xofs[k*3+2];

        for (i = 0; i < ch; i++) {

          buf[dxn + i] += src_d[a+sx1+i] * alpha;

        }

      }

      if ((dy + 1) * scale_y <= sy + 1 || sy === h - 1) {

        beta = (Math.max(sy + 1 - (dy + 1) * scale_y, 0.0) * 256)|0;

        beta1 = 256 - beta;
        b = nw * dy;

        if (beta <= 0) {

          for (dx = 0; dx < nw * ch; dx++) {

            dst_d[b+dx] = Math.min(Math.max((sum[dx] + buf[dx] * 256) / inv_scale_256, 0), 255);
            sum[dx] = buf[dx] = 0;

          }

        } else {

          for (dx = 0; dx < nw * ch; dx++) {

            dst_d[b+dx] = Math.min(Math.max((sum[dx] + buf[dx] * beta1) / inv_scale_256, 0), 255);
            sum[dx] = buf[dx] * beta;
            buf[dx] = 0;

          }

        }

        dy++;

      } else {

        for(dx = 0; dx < nw * ch; dx++) {

          sum[dx] += buf[dx] * 256;
          buf[dx] = 0;

        }

      }

    }

    Cache.putBuffer(sum_node);
    Cache.putBuffer(buf_node);
    Cache.putBuffer(xofs_node);

  }// _resample_u8

  // _resample
  function _resample ( src, dst, nw, nh ) {

    var xofs_count=0;
    var ch=src.channel,w=src.cols,h=src.rows;
    var src_d=src.data,dst_d=dst.data;
    var scale_x = w / nw, scale_y = h / nh;
    var scale = 1.0 / (scale_x * scale_y);
    var
      dx=0,
      dy=0,
      sx=0,
      sy=0,
      sx1=0,sx2=0,i=0,k=0,fsx1=0.0,fsx2=0.0;
    var a=0,b=0,dxn=0,alpha=0.0,beta=0.0,beta1=0.0;

    var buf_node = Cache.getBuffer((nw*ch)<<2);
    var sum_node = Cache.getBuffer((nw*ch)<<2);
    var xofs_node = Cache.getBuffer((w*2*3)<<2);

    var buf = buf_node.f32;
    var sum = sum_node.f32;
    var xofs = xofs_node.f32;

    for (; dx < nw; dx++) {

      fsx1 = dx * scale_x;
      fsx2 = fsx1 + scale_x;

      sx1 = (fsx1 + 1.0 - 1e-6)|0;
      sx2 = fsx2|0;

      sx1 = Math.min(sx1, w - 1);
      sx2 = Math.min(sx2, w - 1);

      if(sx1 > fsx1) {

        xofs_count++;
        xofs[k++] = ((sx1 - 1)*ch)|0;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = (sx1 - fsx1) * scale;

      }
      for(sx = sx1; sx < sx2; sx++){

        xofs_count++;
        xofs[k++] = (sx * ch)|0;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = scale;

      }

      if(fsx2 - sx2 > 1e-3) {

        xofs_count++;
        xofs[k++] = (sx2 * ch)|0;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = (fsx2 - sx2) * scale;

      }

    }

    for (dx = 0; dx < nw * ch; dx++) {

      buf[dx] = sum[dx] = 0;

    }

    dy = 0;
    for (sy = 0; sy < h; sy++) {

      a = w * sy;

      for (k = 0; k < xofs_count; k++) {

        sx1 = xofs[k*3]|0;
        dxn = xofs[k*3+1]|0;
        alpha = xofs[k*3+2];

        for (i = 0; i < ch; i++) {

          buf[dxn + i] += src_d[a+sx1+i] * alpha;

        }

      }

      if ((dy + 1) * scale_y <= sy + 1 || sy === h - 1) {

        beta = Math.max(sy + 1 - (dy + 1) * scale_y, 0.0);
        beta1 = 1.0 - beta;
        b = nw * dy;

        if (Math.abs(beta) < 1e-3) {

          for (dx = 0; dx < nw * ch; dx++) {

            dst_d[b+dx] = sum[dx] + buf[dx];
            sum[dx] = buf[dx] = 0;

          }

        } else {

          for (dx = 0; dx < nw * ch; dx++) {

            dst_d[b+dx] = sum[dx] + buf[dx] * beta1;
            sum[dx] = buf[dx] * beta;
            buf[dx] = 0;

          }

        }

        dy++;

      } else {

        for(dx = 0; dx < nw * ch; dx++) {

          sum[dx] += buf[dx];
          buf[dx] = 0;

        }

      }

    }

    Cache.putBuffer(sum_node);
    Cache.putBuffer(buf_node);
    Cache.putBuffer(xofs_node);

  }// _resample

  function _convol_u8 (buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel) {

    var i=0,j=0,k=0,sp=0,dp=0,sum=0,sum1=0,sum2=0,sum3=0,f0=filter[0],fk=0;
    var w2=w<<1,w3=w*3,w4=w<<2;

    // hor pass
    for (; i < h; ++i) {

      sum = src_d[sp];

      for (j = 0; j < half_kernel; ++j) {

        buf[j] = sum;

      }

      for (j = 0; j <= w-2; j+=2) {

        buf[j + half_kernel] = src_d[sp+j];
        buf[j + half_kernel+1] = src_d[sp+j+1];

      }

      for (; j < w; ++j) {

        buf[j + half_kernel] = src_d[sp+j];

      }

      sum = src_d[sp+w-1];

      for (j = w; j < half_kernel + w; ++j) {

        buf[j + half_kernel] = sum;

      }

      for (j = 0; j <= w-4; j+=4) {

        sum = buf[j] * f0;
        sum1 = buf[j+1] * f0;
        sum2 = buf[j+2] * f0;
        sum3 = buf[j+3] * f0;

        for (k = 1; k < kernel_size; ++k) {

          fk = filter[k];
          sum += buf[k + j] * fk;
          sum1 += buf[k + j+1] * fk;
          sum2 += buf[k + j+2] * fk;
          sum3 += buf[k + j+3] * fk;

        }

        dst_d[dp+j] = Math.min(sum >> 8, 255);
        dst_d[dp+j+1] = Math.min(sum1 >> 8, 255);
        dst_d[dp+j+2] = Math.min(sum2 >> 8, 255);
        dst_d[dp+j+3] = Math.min(sum3 >> 8, 255);

      }

      for (; j < w; ++j) {

        sum = buf[j] * f0;

        for (k = 1; k < kernel_size; ++k) {

          sum += buf[k + j] * filter[k];

        }

        dst_d[dp+j] = Math.min(sum >> 8, 255);

      }

      sp += w;
      dp += w;

    }

    // vert pass
    for (i = 0; i < w; ++i) {

      sum = dst_d[i];

      for (j = 0; j < half_kernel; ++j) {

        buf[j] = sum;

      }

      k = i;

      for (j = 0; j <= h-2; j+=2, k+=w2) {

        buf[j+half_kernel] = dst_d[k];
        buf[j+half_kernel+1] = dst_d[k+w];

      }

      for (; j < h; ++j, k+=w) {

        buf[j+half_kernel] = dst_d[k];

      }

      sum = dst_d[(h-1)*w + i];

      for (j = h; j < half_kernel + h; ++j) {

        buf[j + half_kernel] = sum;

      }

      dp = i;

      for (j = 0; j <= h-4; j+=4, dp+=w4) {

        sum = buf[j] * f0;
        sum1 = buf[j+1] * f0;
        sum2 = buf[j+2] * f0;
        sum3 = buf[j+3] * f0;

        for (k = 1; k < kernel_size; ++k) {

          fk = filter[k];
          sum += buf[k + j] * fk;
          sum1 += buf[k + j+1] * fk;
          sum2 += buf[k + j+2] * fk;
          sum3 += buf[k + j+3] * fk;

        }

        dst_d[dp] = Math.min(sum >> 8, 255);
        dst_d[dp+w] = Math.min(sum1 >> 8, 255);
        dst_d[dp+w2] = Math.min(sum2 >> 8, 255);
        dst_d[dp+w3] = Math.min(sum3 >> 8, 255);

      }

      for (; j < h; ++j, dp+=w) {

        sum = buf[j] * f0;

        for (k = 1; k < kernel_size; ++k) {

          sum += buf[k + j] * filter[k];

        }

        dst_d[dp] = Math.min(sum >> 8, 255);

      }

    }

  }// _convol_u8

  function _convol (buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel) {

    var i=0,j=0,k=0,sp=0,dp=0,sum=0.0,sum1=0.0,sum2=0.0,sum3=0.0,f0=filter[0],fk=0.0;

    var w2=w<<1,w3=w*3,w4=w<<2;

    // hor pass
    for (; i < h; ++i) {

      sum = src_d[sp];

      for (j = 0; j < half_kernel; ++j) {

        buf[j] = sum;

      }

      for (j = 0; j <= w-2; j+=2) {

        buf[j + half_kernel] = src_d[sp+j];
        buf[j + half_kernel+1] = src_d[sp+j+1];

      }

      for (; j < w; ++j) {

        buf[j + half_kernel] = src_d[sp+j];

      }

      sum = src_d[sp+w-1];

      for (j = w; j < half_kernel + w; ++j) {

        buf[j + half_kernel] = sum;

      }

      for (j = 0; j <= w-4; j+=4) {

        sum = buf[j] * f0;
        sum1 = buf[j+1] * f0;
        sum2 = buf[j+2] * f0;
        sum3 = buf[j+3] * f0;

        for (k = 1; k < kernel_size; ++k) {

          fk = filter[k];
          sum += buf[k + j] * fk;
          sum1 += buf[k + j+1] * fk;
          sum2 += buf[k + j+2] * fk;
          sum3 += buf[k + j+3] * fk;

        }

        dst_d[dp+j] = sum;
        dst_d[dp+j+1] = sum1;
        dst_d[dp+j+2] = sum2;
        dst_d[dp+j+3] = sum3;

      }

      for (; j < w; ++j) {

        sum = buf[j] * f0;

        for (k = 1; k < kernel_size; ++k) {

          sum += buf[k + j] * filter[k];

        }

        dst_d[dp+j] = sum;

      }

      sp += w;
      dp += w;

    }

    // vert pass
    for (i = 0; i < w; ++i) {

      sum = dst_d[i];

      for (j = 0; j < half_kernel; ++j) {

        buf[j] = sum;

      }

      k = i;

      for (j = 0; j <= h-2; j+=2, k+=w2) {

        buf[j+half_kernel] = dst_d[k];
        buf[j+half_kernel+1] = dst_d[k+w];

      }

      for (; j < h; ++j, k+=w) {

        buf[j+half_kernel] = dst_d[k];

      }

      sum = dst_d[(h-1)*w + i];

      for (j = h; j < half_kernel + h; ++j) {

        buf[j + half_kernel] = sum;

      }

      dp = i;

      for (j = 0; j <= h-4; j+=4, dp+=w4) {

        sum = buf[j] * f0;
        sum1 = buf[j+1] * f0;
        sum2 = buf[j+2] * f0;
        sum3 = buf[j+3] * f0;

        for (k = 1; k < kernel_size; ++k) {

          fk = filter[k];
          sum += buf[k + j] * fk;
          sum1 += buf[k + j+1] * fk;
          sum2 += buf[k + j+2] * fk;
          sum3 += buf[k + j+3] * fk;

        }

        dst_d[dp] = sum;
        dst_d[dp+w] = sum1;
        dst_d[dp+w2] = sum2;
        dst_d[dp+w3] = sum3;

      }

      for (; j < h; ++j, dp+=w) {

        sum = buf[j] * f0;

        for (k = 1; k < kernel_size; ++k) {

          sum += buf[k + j] * filter[k];

        }

        dst_d[dp] = sum;

      }

    }

  }// _convol


  var Processing = ( function () {

    /**
     * @class Processing
     * @static
     * @constructor
     */
    function Processing () {
      throw new Error( 'Processing can\'t create instance.' );
    }

    var p = Processing.prototype;
    p.constructor = Processing;

    /**
     * Convert color array input [r0,g0,b0,a0, ...] to grayscale using Y = 0.299*R + 0.587*G + 0.114*B formula. You can specify the source input channel order such as BGRA, RGBA, RGB and BGR.
     *
     *
     *      context2d.drawImage(video, 0, 0, width, height);
     *      var image_data = context2d.getImageData(0, 0, width, height);
     *
     *      var gray_img = new Igata.Matrix_t(width, height, Igata.U8_t | Igata.C1_t);
     *      var code = Igata.COLOR_RGBA2GRAY;
     *      Igata.Processing.grayscale(image_data.data, width, height, gray_img, code);
     *
     *
     *
     * @method grayscale
     * @static
     * @param {ImageData} src
     * @param {number} w width
     * @param {number} h height
     * @param {Matrix_t} dst
     * @param {number=COLOR_RGBA2GRAY} [code] COLOR_BGRA2GRAY || COLOR_BGR2GRAY
     */
    Processing.grayscale = function ( src, w, h, dst, code ) {

      // this is default image data representation in browser
      if (typeof code === "undefined") { code = COLOR_RGBA2GRAY; }

      var x=0, y=0, i=0, j=0, ir=0,jr=0;
      var coeff_r = 4899, coeff_g = 9617, coeff_b = 1868, cn = 4;

      if(code === COLOR_BGRA2GRAY || code === COLOR_BGR2GRAY) {

        coeff_r = 1868;
        coeff_b = 4899;

      }
      if(code === COLOR_RGB2GRAY || code === COLOR_BGR2GRAY) {

        cn = 3;

      }
      var cn2 = cn<<1, cn3 = (cn*3)|0;

      dst.resize(w, h, 1);
      var dst_u8 = dst.data;
      var limit;

      for(y = 0; y < h; ++y, j+=w, i+=w*cn) {

        for(x = 0, ir = i, jr = j, limit = w-4; x <= limit; x+=4, ir+=cn<<2, jr+=4) {

          dst_u8[jr]     = (src[ir]     * coeff_r + src[ir+1]     * coeff_g + src[ir+2]     * coeff_b + 8192) >> 14;
          dst_u8[jr + 1] = (src[ir+cn]  * coeff_r + src[ir+cn+1]  * coeff_g + src[ir+cn+2]  * coeff_b + 8192) >> 14;
          dst_u8[jr + 2] = (src[ir+cn2] * coeff_r + src[ir+cn2+1] * coeff_g + src[ir+cn2+2] * coeff_b + 8192) >> 14;
          dst_u8[jr + 3] = (src[ir+cn3] * coeff_r + src[ir+cn3+1] * coeff_g + src[ir+cn3+2] * coeff_b + 8192) >> 14;

        }

        for (; x < w; ++x, ++jr, ir+=cn) {

          dst_u8[jr] = (src[ir] * coeff_r + src[ir+1] * coeff_g + src[ir+2] * coeff_b + 8192) >> 14;

        }

      }

    };

    // derived from CCV library
    /**
     * Generic resize method. Works with single and multi channel matrix_t. If performance is critical or you need multiple image resizings it is recommended to use canvas built-in drawImage() method.
     *
     * @method resample
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {number} nw new width
     * @param {number} nh new height
     */
    Processing.resample = function ( src, dst, nw, nh ) {

      var
        h=src.rows,
        w=src.cols;

      if (h > nh && w > nw) {

        dst.resize(nw, nh, src.channel);

        // using the fast alternative (fix point scale, 0x100 to avoid overflow)
        if (src.type&U8_t && dst.type&U8_t && h * w / (nh * nw) < 0x100) {

          _resample_u8(src, dst, nw, nh);

        } else {

          _resample(src, dst, nw, nh);

        }
      }

    };

    /**
     * Works with single channel data only. NOTE: if input is jsfeat.U8_t and options = jsfeat.BOX_BLUR_NOSCALE dest should be at least jsfeat.S32_t to handle accumulated values correctly.
     *
     * @method boxGray
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {number} radius
     * @param {number=0} [options]
     */
    Processing.boxGray = function ( src, dst, radius, options ) {

      if (typeof options === "undefined") { options = 0; }

      var w=src.cols, h=src.rows, h2=h<<1, w2=w<<1;
      var
        i=0,
        x=0,
        y=0,
        end=0;

      var windowSize = ((radius << 1) + 1)|0;
      var radiusPlusOne = (radius + 1)|0, radiusPlus2 = (radiusPlusOne+1)|0;
      var scale = options&BOX_BLUR_NOSCALE ? 1 : (1.0 / (windowSize*windowSize));

      var tmp_buff = Cache.getBuffer((w*h)<<2);

      var sum=0, dstIndex=0, srcIndex = 0, nextPixelIndex=0, previousPixelIndex=0;
      var data_i32 = tmp_buff.i32; // to prevent overflow
      var data_u8 = src.data;
      var hold=0;

      dst.resize(w, h, src.channel);

      // first pass
      // no need to scale
      //data_u8 = src.data;
      //data_i32 = tmp;
      for (y = 0; y < h; ++y) {
        dstIndex = y;
        sum = radiusPlusOne * data_u8[srcIndex];

        for(i = (srcIndex+1)|0, end=(srcIndex+radius)|0; i <= end; ++i) {

          sum += data_u8[i];

        }

        nextPixelIndex = (srcIndex + radiusPlusOne)|0;
        previousPixelIndex = srcIndex;
        hold = data_u8[previousPixelIndex];

        for(x = 0; x < radius; ++x, dstIndex += h) {

          data_i32[dstIndex] = sum;
          sum += data_u8[nextPixelIndex]- hold;
          nextPixelIndex ++;

        }

        for(; x < w-radiusPlus2; x+=2, dstIndex += h2) {

          data_i32[dstIndex] = sum;
          sum += data_u8[nextPixelIndex]- data_u8[previousPixelIndex];

          data_i32[dstIndex+h] = sum;
          sum += data_u8[nextPixelIndex+1]- data_u8[previousPixelIndex+1];

          nextPixelIndex +=2;
          previousPixelIndex +=2;

        }

        for(; x < w-radiusPlusOne; ++x, dstIndex += h) {

          data_i32[dstIndex] = sum;
          sum += data_u8[nextPixelIndex]- data_u8[previousPixelIndex];

          nextPixelIndex ++;
          previousPixelIndex ++;

        }

        hold = data_u8[nextPixelIndex-1];

        for(; x < w; ++x, dstIndex += h) {

          data_i32[dstIndex] = sum;

          sum += hold- data_u8[previousPixelIndex];
          previousPixelIndex ++;

        }

        srcIndex += w;

      }
      //
      // second pass
      srcIndex = 0;
      //data_i32 = tmp; // this is a transpose
      data_u8 = dst.data;

      // dont scale result
      if( scale === 1 ) {

        for ( y = 0; y < w; ++y ) {

          dstIndex = y;
          sum = radiusPlusOne * data_i32[srcIndex];

          for(i = (srcIndex+1)|0, end=(srcIndex+radius)|0; i <= end; ++i) {

            sum += data_i32[i];

          }

          nextPixelIndex = srcIndex + radiusPlusOne;
          previousPixelIndex = srcIndex;
          hold = data_i32[previousPixelIndex];

          for(x = 0; x < radius; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum;
            sum += data_i32[nextPixelIndex]- hold;
            nextPixelIndex ++;

          }

          for(; x < h-radiusPlus2; x+=2, dstIndex += w2) {

            data_u8[dstIndex] = sum;
            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];

            data_u8[dstIndex+w] = sum;
            sum += data_i32[nextPixelIndex+1]- data_i32[previousPixelIndex+1];

            nextPixelIndex +=2;
            previousPixelIndex +=2;

          }

          for(; x < h-radiusPlusOne; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum;

            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];
            nextPixelIndex ++;
            previousPixelIndex ++;

          }

          hold = data_i32[nextPixelIndex-1];

          for(; x < h; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum;

            sum += hold- data_i32[previousPixelIndex];
            previousPixelIndex ++;

          }

          srcIndex += h;

        }

      } else {

        for (y = 0; y < w; ++y) {

          dstIndex = y;
          sum = radiusPlusOne * data_i32[srcIndex];

          for(i = (srcIndex+1)|0, end=(srcIndex+radius)|0; i <= end; ++i) {

            sum += data_i32[i];

          }

          nextPixelIndex = srcIndex + radiusPlusOne;
          previousPixelIndex = srcIndex;
          hold = data_i32[previousPixelIndex];

          for(x = 0; x < radius; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum*scale;
            sum += data_i32[nextPixelIndex]- hold;
            nextPixelIndex ++;

          }

          for(; x < h-radiusPlus2; x+=2, dstIndex += w2) {

            data_u8[dstIndex] = sum*scale;
            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];

            data_u8[dstIndex+w] = sum*scale;
            sum += data_i32[nextPixelIndex+1]- data_i32[previousPixelIndex+1];

            nextPixelIndex +=2;
            previousPixelIndex +=2;

          }
          for(; x < h-radiusPlusOne; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum*scale;

            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];
            nextPixelIndex ++;
            previousPixelIndex ++;

          }

          hold = data_i32[nextPixelIndex-1];

          for(; x < h; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum*scale;

            sum += hold- data_i32[previousPixelIndex];
            previousPixelIndex ++;

          }

          srcIndex += h;

        }
      }

      Cache.putBuffer(tmp_buff);

    };
    /**
     * @deprecated instead use boxGray
     * @method box_blur_gray
     * @static
     * @param src
     * @param dst
     * @param radius
     * @param options
     */
    Processing.box_blur_gray = function ( src, dst, radius, options ) {

      Processing.boxGray( src, dst, radius, options );

    };
    /**
     * @method gaussian
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {number=0} [kernel_size]
     * @param {number=0} [sigma]
     */
    Processing.gaussian = function ( src, dst, kernel_size, sigma ) {

      if (typeof sigma === "undefined") { sigma = 0.0; }

      if (typeof kernel_size === "undefined") { kernel_size = 0; }

      kernel_size = kernel_size === 0 ? (Math.max(1, (4.0 * sigma + 1.0 - 1e-8)) * 2 + 1)|0 : kernel_size;

      var half_kernel = kernel_size >> 1;
      var w = src.cols, h = src.rows;
      var data_type = src.type, is_u8 = data_type&U8_t;

      dst.resize(w, h, src.channel);

      var src_d = src.data, dst_d = dst.data;
      var buf,filter,buf_sz=(kernel_size + Math.max(h, w))|0;

      var buf_node = Cache.getBuffer(buf_sz<<2);
      var filt_node = Cache.getBuffer(kernel_size<<2);

      if(is_u8) {

        buf = buf_node.i32;
        filter = filt_node.i32;

      } else if(data_type&S32_t) {

        buf = buf_node.i32;
        filter = filt_node.f32;

      } else {

        buf = buf_node.f32;
        filter = filt_node.f32;

      }

      Calc.kernel(kernel_size, sigma, filter, data_type);

      if(is_u8) {

        _convol_u8(buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel);

      } else {

        _convol(buf, src_d, dst_d, w, h, filter, kernel_size, half_kernel);

      }

      Cache.putBuffer(buf_node);
      Cache.putBuffer(filt_node);

    };
    /**
     * @deprecated instead use gaussian
     * @method gaussian_blur
     * @static
     * @param src
     * @param dst
     * @param kernel_size
     * @param sigma
     */
    Processing.gaussian_blur = function ( src, dst, kernel_size, sigma ) {

      Processing.gaussian( src, dst, kernel_size, sigma );

    };
    /**
     * @method transform
     * @static
     * @param {ImageData} img
     * @param {number} rho_res
     * @param {number} theta_res
     * @param threshold
     * @return {Array}
     */
    Processing.transform = function ( img, rho_res, theta_res, threshold ) {

      var image = img.data;

      var width = img.cols;
      var height = img.rows;
      var step = width;

      var min_theta = 0.0;
      var max_theta = Math.PI;

      var numangle = Math.round((max_theta - min_theta) / theta_res);
      var numrho = Math.round(((width + height) * 2 + 1) / rho_res);
      var irho = 1.0 / rho_res;

      var accum = new Int32Array((numangle+2) * (numrho+2)); //typed arrays are initialized to 0
      var tabSin = new Float32Array(numangle);
      var tabCos = new Float32Array(numangle);

      var n=0;
      var ang = min_theta;
      var r;

      for(; n < numangle; n++ ) {

        tabSin[n] = Math.sin(ang) * irho;
        tabCos[n] = Math.cos(ang) * irho;
        ang += theta_res;

      }

      // stage 1. fill accumulator
      var j;

      for( i = 0; i < height; i++ ) {

        for( j = 0; j < width; j++ ) {

          if( image[i * step + j] !== 0 ) {

            //console.log(r, (n+1) * (numrho+2) + r+1, tabCos[n], tabSin[n]);
            for( n = 0; n < numangle; n++ ) {

              r = Math.round( j * tabCos[n] + i * tabSin[n] );
              r += (numrho - 1) / 2;
              accum[(n+1) * (numrho+2) + r+1] += 1;

            }// for

          }// if

        }// for

      }// for

      // stage 2. find local maximums
      // ToDo: Consider making a vector class that uses typed arrays
      //_sort_buf = new Array();
      var _sort_buf = [];
      var base;

      for( r = 0; r < numrho; r++ ) {

        for( n = 0; n < numangle; n++ ) {

          base = (n+1) * (numrho+2) + r+1;

          if( accum[base] > threshold &&
            accum[base] > accum[base - 1] && accum[base] >= accum[base + 1] &&
            accum[base] > accum[base - numrho - 2] && accum[base] >= accum[base + numrho + 2] ) {

            _sort_buf.push(base);

          }// if

        }// for

      }// for

      // stage 3. sort the detected lines by accumulator value
      _sort_buf.sort(function(l1, l2) {

        return accum[l1] > accum[l2] || (accum[l1] === accum[l2] && l1 < l2);

      });

      // stage 4. store the first min(total,linesMax) lines to the output buffer
      var linesMax = Math.min(numangle*numrho, _sort_buf.length);
      var scale = 1.0 / (numrho+2);
      //var lines = new Array();
      var lines = [];
      var
        idx, lrho, langle, i;

      for( i = 0; i < linesMax; i++ ) {

        idx = _sort_buf[i];
        n = Math.floor(idx*scale) - 1;
        r = idx - (n+1)*(numrho+2) - 1;
        lrho = (r - (numrho - 1)*0.5) * rho_res;
        langle = n * theta_res;
        lines.push([lrho, langle]);

      }

      return lines;

    };
    /**
     * @deprecated instead use transform
     * @method hough_transform
     * @static
     * @param img
     * @param rho_res
     * @param theta_res
     * @param threshold
     * @return {Array}
     */
    Processing.hough_transform = function ( img, rho_res, theta_res, threshold ) {

      return Processing.transform( img, rho_res, theta_res, threshold );

    };

    /**
     * Down sample source to dest writing simple 4 pix average value. Works with single channel only.
     *
     * assume we always need it for u8 image
     *
     * @method pyrdown
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {number=0} [sx]
     * @param {number=0} [sy]
     */
    Processing.pyrdown = function( src, dst, sx, sy ) {

      // this is needed for bbf
      if (typeof sx === "undefined") { sx = 0; }
      if (typeof sy === "undefined") { sy = 0; }

      var w = src.cols, h = src.rows;
      var w2 = w >> 1, h2 = h >> 1;
      var _w2 = w2 - (sx << 1), _h2 = h2 - (sy << 1);
      var
        x=0,
        y=0,
        sptr=sx+sy*w,
        sline=0,
        dptr=0,
        dline=0;

      dst.resize(w2, h2, src.channel);

      var src_d = src.data, dst_d = dst.data;

      for(y = 0; y < _h2; ++y) {

        sline = sptr;
        dline = dptr;

        for(x = 0; x <= _w2-2; x+=2, dline+=2, sline += 4) {

          dst_d[dline] = (src_d[sline] + src_d[sline+1] + src_d[sline+w] + src_d[sline+w+1] + 2) >> 2;
          dst_d[dline+1] = (src_d[sline+2] + src_d[sline+3] + src_d[sline+w+2] + src_d[sline+w+3] + 2) >> 2;

        }

        for(; x < _w2; ++x, ++dline, sline += 2) {

          dst_d[dline] = (src_d[sline] + src_d[sline+1] + src_d[sline+w] + src_d[sline+w+1] + 2) >> 2;

        }

        sptr += w << 1;
        dptr += w2;

      }
    };

    //
    /**
     * Compute gradient using Scharr kernel [3 10 3] * [-1 0 1]^T. Works with single channel only.
     *
     * dst: [gx,gy,...]
     *
     * @method scharrDerivatives
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     */
    Processing.scharrDerivatives = function ( src, dst ) {

      var w = src.cols, h = src.rows;
      var dstep = w<<1,x=0,y=0,x1=0,a,b,c,d,e,f;
      var srow0=0,srow1=0,srow2=0,drow=0;
      var trow0,trow1;

      dst.resize(w, h, 2); // 2 channel output gx, gy

      var img = src.data, gxgy=dst.data;

      var buf0_node = Cache.getBuffer((w+2)<<2);
      var buf1_node = Cache.getBuffer((w+2)<<2);

      if(src.type&U8_t || src.type&S32_t) {

        trow0 = buf0_node.i32;
        trow1 = buf1_node.i32;

      } else {

        trow0 = buf0_node.f32;
        trow1 = buf1_node.f32;

      }

      for(; y < h; ++y, srow1+=w) {

        srow0 = ((y > 0 ? y-1 : 1)*w)|0;
        srow2 = ((y < h-1 ? y+1 : h-2)*w)|0;
        drow = (y*dstep)|0;

        // do vertical convolution
        for(x = 0, x1 = 1; x <= w-2; x+=2, x1+=2) {

          a = img[srow0+x];
          b = img[srow2+x];
          trow0[x1] = ( (a + b)*3 + (img[srow1+x])*10 );
          trow1[x1] = ( b - a );
          //
          a = img[srow0+x+1];
          b = img[srow2+x+1];
          trow0[x1+1] = ( (a + b)*3 + (img[srow1+x+1])*10 );
          trow1[x1+1] = ( b - a );
        }

        for(; x < w; ++x, ++x1) {

          a = img[srow0+x];
          b = img[srow2+x];
          trow0[x1] = ( (a + b)*3 + (img[srow1+x])*10 );
          trow1[x1] = ( b - a );

        }

        // make border
        x = (w + 1)|0;
        trow0[0] = trow0[1]; trow0[x] = trow0[w];
        trow1[0] = trow1[1]; trow1[x] = trow1[w];

        // do horizontal convolution, interleave the results and store them
        for(x = 0; x <= w-4; x+=4) {

          a = trow1[x+2];
          b = trow1[x+1];
          c = trow1[x+3];
          d = trow1[x+4];
          e = trow0[x+2];
          f = trow0[x+3];

          gxgy[drow++] = ( e - trow0[x] );
          gxgy[drow++] = ( (a + trow1[x])*3 + b*10 );
          gxgy[drow++] = ( f - trow0[x+1] );
          gxgy[drow++] = ( (c + b)*3 + a*10 );

          gxgy[drow++] = ( (trow0[x+4] - e) );
          gxgy[drow++] = ( ((d + a)*3 + c*10) );
          gxgy[drow++] = ( (trow0[x+5] - f) );
          gxgy[drow++] = ( ((trow1[x+5] + c)*3 + d*10) );

        }

        for(; x < w; ++x) {

          gxgy[drow++] = ( (trow0[x+2] - trow0[x]) );
          gxgy[drow++] = ( ((trow1[x+2] + trow1[x])*3 + trow1[x+1]*10) );

        }

      }

      Cache.putBuffer(buf0_node);
      Cache.putBuffer(buf1_node);

    };
    /**
     * @deprecated instead use scharrDerivatives
     * @method scharr_derivatives
     * @static
     * @param src
     * @param dst
     */
    Processing.scharr_derivatives = function ( src, dst ) {

      Processing.scharrDerivatives( src, dst );

    };

    /**
     * compute gradient using Sobel kernel [1 2 1] * [-1 0 1]^T
     *
     * dst: [gx,gy,...]
     *
     * @method sobelDerivatives
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     */
    Processing.sobelDerivatives = function ( src, dst ) {

      var w = src.cols, h = src.rows;
      var dstep = w<<1,x=0,y=0,x1=0,a,b,c,d,e,f;
      var srow0=0,srow1=0,srow2=0,drow=0;
      var trow0,trow1;

      dst.resize(w, h, 2); // 2 channel output gx, gy

      var img = src.data, gxgy=dst.data;

      var buf0_node = Cache.getBuffer((w+2)<<2);
      var buf1_node = Cache.getBuffer((w+2)<<2);

      if(src.type&U8_t || src.type&S32_t) {

        trow0 = buf0_node.i32;
        trow1 = buf1_node.i32;

      } else {

        trow0 = buf0_node.f32;
        trow1 = buf1_node.f32;

      }

      for(; y < h; ++y, srow1+=w) {

        srow0 = ((y > 0 ? y-1 : 1)*w)|0;
        srow2 = ((y < h-1 ? y+1 : h-2)*w)|0;
        drow = (y*dstep)|0;

        // do vertical convolution
        for(x = 0, x1 = 1; x <= w-2; x+=2, x1+=2) {

          a = img[srow0+x];
          b = img[srow2+x];
          trow0[x1] = ( (a + b) + (img[srow1+x]*2) );
          trow1[x1] = ( b - a );
          //
          a = img[srow0+x+1];
          b = img[srow2+x+1];
          trow0[x1+1] = ( (a + b) + (img[srow1+x+1]*2) );
          trow1[x1+1] = ( b - a );

        }

        for(; x < w; ++x, ++x1) {

          a = img[srow0+x];
          b = img[srow2+x];
          trow0[x1] = ( (a + b) + (img[srow1+x]*2) );
          trow1[x1] = ( b - a );

        }

        // make border
        x = (w + 1)|0;
        trow0[0] = trow0[1]; trow0[x] = trow0[w];
        trow1[0] = trow1[1]; trow1[x] = trow1[w];

        // do horizontal convolution, interleave the results and store them
        for(x = 0; x <= w-4; x+=4) {

          a = trow1[x+2];
          b = trow1[x+1];
          c = trow1[x+3];
          d = trow1[x+4];
          e = trow0[x+2];
          f = trow0[x+3];

          gxgy[drow++] = ( e - trow0[x] );
          gxgy[drow++] = ( a + trow1[x] + b*2 );
          gxgy[drow++] = ( f - trow0[x+1] );
          gxgy[drow++] = ( c + b + a*2 );

          gxgy[drow++] = ( trow0[x+4] - e );
          gxgy[drow++] = ( d + a + c*2 );
          gxgy[drow++] = ( trow0[x+5] - f );
          gxgy[drow++] = ( trow1[x+5] + c + d*2 );

        }

        for(; x < w; ++x) {

          gxgy[drow++] = ( trow0[x+2] - trow0[x] );
          gxgy[drow++] = ( trow1[x+2] + trow1[x] + trow1[x+1]*2 );

        }

      }

      Cache.putBuffer(buf0_node);
      Cache.putBuffer(buf1_node);

    };
    /**
     * @deprecated instead use sobelDerivatives
     * @method sobel_derivatives
     * @static
     * @param src
     * @param dst
     */
    Processing.sobel_derivatives = function ( src, dst ) {

      Processing.sobelDerivatives( src, dst );

    };

    /**
     * Calculates one or more integral images for the source image. Using these integral images, one may calculate sum, mean, standard deviation over arbitrary up-right or rotated rectangular region of the image in a constant time. NOTE: each destinatination should be 1 pixel larger than source width = source.cols+1, height = source.rows+1. Single channel source only.
     *
     * `please note:`
     *
     * dst_(type) size should be cols = src.cols+1, rows = src.rows+1
     *
     * @method integralImage
     * @static
     * @param {Matrix_t} src
     * @param {Array} dst_sum
     * @param {Array} dst_sqsum
     * @param {Array} dst_tilted
     */
    Processing.integralImage = function ( src, dst_sum, dst_sqsum, dst_tilted ) {

      var w0=src.cols|0,h0=src.rows|0,src_d=src.data;
      var w1=(w0+1)|0;
      var s=0,s2=0,p=0,pup=0,i=0,j=0,v=0,k=0;

      if(dst_sum && dst_sqsum) {
        // fill first row with zeros
        for(; i < w1; ++i) {

          dst_sum[i] = 0;
          dst_sqsum[i] = 0;

        }

        p = (w1+1)|0;
        pup = 1;

        for(i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          s = s2 = 0;

          for(j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

            v = src_d[k];
            s += v;
            s2 += v*v;
            dst_sum[p] = dst_sum[pup] + s;
            dst_sqsum[p] = dst_sqsum[pup] + s2;

            v = src_d[k+1];
            s += v;
            s2 += v*v;
            dst_sum[p+1] = dst_sum[pup+1] + s;
            dst_sqsum[p+1] = dst_sqsum[pup+1] + s2;

          }

          for(; j < w0; ++j, ++k, ++p, ++pup) {

            v = src_d[k];
            s += v;
            s2 += v*v;
            dst_sum[p] = dst_sum[pup] + s;
            dst_sqsum[p] = dst_sqsum[pup] + s2;

          }

        }

      } else if(dst_sum) {

        // fill first row with zeros
        for(; i < w1; ++i) {

          dst_sum[i] = 0;

        }

        p = (w1+1)|0;
        pup = 1;

        for(i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          s = 0;

          for(j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

            s += src_d[k];
            dst_sum[p] = dst_sum[pup] + s;
            s += src_d[k+1];
            dst_sum[p+1] = dst_sum[pup+1] + s;

          }

          for(; j < w0; ++j, ++k, ++p, ++pup) {

            s += src_d[k];
            dst_sum[p] = dst_sum[pup] + s;

          }

        }

      } else if(dst_sqsum) {

        // fill first row with zeros
        for(; i < w1; ++i) {

          dst_sqsum[i] = 0;

        }

        p = (w1+1)|0;
        pup = 1;

        for(i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          s2 = 0;

          for(j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

            v = src_d[k];
            s2 += v*v;
            dst_sqsum[p] = dst_sqsum[pup] + s2;
            v = src_d[k+1];
            s2 += v*v;
            dst_sqsum[p+1] = dst_sqsum[pup+1] + s2;

          }

          for(; j < w0; ++j, ++k, ++p, ++pup) {

            v = src_d[k];
            s2 += v*v;
            dst_sqsum[p] = dst_sqsum[pup] + s2;

          }

        }

      }

      if(dst_tilted) {

        // fill first row with zeros
        for(i = 0; i < w1; ++i) {

          dst_tilted[i] = 0;

        }

        // diagonal
        p = (w1+1)|0;
        pup = 0;

        for(i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          for(j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

            dst_tilted[p] = src_d[k] + dst_tilted[pup];
            dst_tilted[p+1] = src_d[k+1] + dst_tilted[pup+1];

          }

          for(; j < w0; ++j, ++k, ++p, ++pup) {

            dst_tilted[p] = src_d[k] + dst_tilted[pup];

          }

        }

        // diagonal
        p = (w1+w0)|0;
        pup = w0;

        for(i = 0; i < h0; ++i, p+=w1, pup+=w1) {

          dst_tilted[p] += dst_tilted[pup];

        }

        for(j = w0-1; j > 0; --j) {

          p = j+h0*w1;
          pup=p-w1;

          for(i = h0; i > 0; --i, p-=w1, pup-=w1) {

            dst_tilted[p] += dst_tilted[pup] + dst_tilted[pup+1];

          }

        }

      }

    };
    /**
     * @deprecated instead use integralImage
     * @method compute_integral_image
     * @static
     * @param src
     * @param dst_sum
     * @param dst_sqsum
     * @param dst_tilted
     */
    Processing.compute_integral_image = function ( src, dst_sum, dst_sqsum, dst_tilted ) {

      Processing.integralImage( src, dst_sum, dst_sqsum, dst_tilted );

    };
    /**
     * Equalizes the histogram of a grayscale image. The algorithm normalizes the brightness and increases the contrast of the image.
     *
     * @method histogram
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     */
    Processing.histogram = function ( src, dst ) {

      var w=src.cols,h=src.rows,src_d=src.data;

      dst.resize(w, h, src.channel);

      var dst_d=dst.data,size=w*h;
      var
        i=0,
        prev=0,
        hist0,norm;

      var hist0_node = Cache.getBuffer(256<<2);

      hist0 = hist0_node.i32;

      for(; i < 256; ++i) {

        hist0[i] = 0;

      }

      for (i = 0; i < size; ++i) {

        ++hist0[src_d[i]];

      }

      prev = hist0[0];

      for (i = 1; i < 256; ++i) {

        prev = hist0[i] += prev;

      }

      norm = 255 / size;

      for (i = 0; i < size; ++i) {

        dst_d[i] = (hist0[src_d[i]] * norm + 0.5)|0;

      }

      Cache.putBuffer(hist0_node);

    };
    /**
     * @deprecated instead use histogram
     * @method equalize_histogram
     * @static
     * @param src
     * @param dst
     */
    Processing.equalize_histogram = function ( src, dst ) {

      Processing.histogram( src, dst );

    };
    /**
     * Canny edge detector. Result contains only 0x00 and 0xFF values.
     *
     * @method canny
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {number} low_thresh
     * @param {number} high_thresh
     */
    Processing.canny = function ( src, dst, low_thresh, high_thresh ) {

      var
        w=src.cols,
        h=src.rows,
        src_d=src.data;

      dst.resize(w, h, src.channel);

      var dst_d=dst.data;
      var i=0,j=0,grad=0,w2=w<<1,_grad=0,suppress=0,f=0,x=0,y=0,s=0;
      var tg22x=0,tg67x=0;

      // cache buffers
      var dxdy_node = Cache.getBuffer((h * w2)<<2);
      var buf_node = Cache.getBuffer((3 * (w + 2))<<2);
      var map_node = Cache.getBuffer(((h+2) * (w + 2))<<2);
      var stack_node = Cache.getBuffer((h * w)<<2);


      var buf = buf_node.i32;
      var map = map_node.i32;
      var stack = stack_node.i32;
      var dxdy = dxdy_node.i32;
      var dxdy_m = new Matrix_t(w, h, global.S32C2_t, dxdy_node.data);
      var
        row0=1,
        row1=(w+2+1)|0,
        row2=(2*(w+2)+1)|0,
        map_w=(w+2)|0,
        map_i=(map_w+1)|0,
        stack_i=0;

      //this.sobel_derivatives(src, dxdy_m);
      Processing.sobelDerivatives(src, dxdy_m);

      if(low_thresh > high_thresh) {

        i = low_thresh;
        low_thresh = high_thresh;
        high_thresh = i;

      }

      i = (3 * (w + 2))|0;

      while(--i>=0) {

        buf[i] = 0;

      }

      i = ((h+2) * (w + 2))|0;

      while(--i>=0) {

        map[i] = 0;

      }

      for (; j < w; ++j, grad+=2) {

        //buf[row1+j] = Math.abs(dxdy[grad]) + Math.abs(dxdy[grad+1]);
        x = dxdy[grad];
        y = dxdy[grad+1];
        //buf[row1+j] = x*x + y*y;
        buf[row1+j] = ((x ^ (x >> 31)) - (x >> 31)) + ((y ^ (y >> 31)) - (y >> 31));

      }

      for(i=1; i <= h; ++i, grad+=w2) {

        if(i === h) {

          j = row2+w;

          while(--j>=row2) {

            buf[j] = 0;

          }

        } else {

          for (j = 0; j < w; j++) {

            //buf[row2+j] =  Math.abs(dxdy[grad+(j<<1)]) + Math.abs(dxdy[grad+(j<<1)+1]);
            x = dxdy[grad+(j<<1)];
            y = dxdy[grad+(j<<1)+1];
            //buf[row2+j] = x*x + y*y;
            buf[row2+j] = ((x ^ (x >> 31)) - (x >> 31)) + ((y ^ (y >> 31)) - (y >> 31));

          }

        }

        _grad = (grad - w2)|0;
        map[map_i-1] = 0;
        suppress = 0;

        for(j = 0; j < w; ++j, _grad+=2) {

          f = buf[row1+j];

          if (f > low_thresh) {

            x = dxdy[_grad];
            y = dxdy[_grad+1];
            s = x ^ y;
            // seems ot be faster than Math.abs
            x = ((x ^ (x >> 31)) - (x >> 31))|0;
            y = ((y ^ (y >> 31)) - (y >> 31))|0;
            //x * tan(22.5) x * tan(67.5) == 2 * x + x * tan(22.5)
            tg22x = x * 13573;
            tg67x = tg22x + ((x + x) << 15);
            y <<= 15;

            if (y < tg22x) {

              if (f > buf[row1+j-1] && f >= buf[row1+j+1]) {

                if (f > high_thresh && !suppress && map[map_i+j-map_w] !== 2) {

                  map[map_i+j] = 2;
                  suppress = 1;
                  stack[stack_i++] = map_i + j;

                } else {

                  map[map_i+j] = 1;

                }

                continue;

              }

            } else if (y > tg67x) {

              if (f > buf[row0+j] && f >= buf[row2+j]) {

                if (f > high_thresh && !suppress && map[map_i+j-map_w] !== 2) {

                  map[map_i+j] = 2;
                  suppress = 1;
                  stack[stack_i++] = map_i + j;

                } else {

                  map[map_i+j] = 1;

                }

                continue;

              }

            } else {

              s = s < 0 ? -1 : 1;

              if (f > buf[row0+j-s] && f > buf[row2+j+s]) {

                if (f > high_thresh && !suppress && map[map_i+j-map_w] !== 2) {

                  map[map_i+j] = 2;
                  suppress = 1;
                  stack[stack_i++] = map_i + j;

                } else {

                  map[map_i+j] = 1;

                }

                continue;

              }
            }
          }

          map[map_i+j] = 0;
          suppress = 0;

        }

        map[map_i+w] = 0;
        map_i += map_w;
        j = row0;
        row0 = row1;
        row1 = row2;
        row2 = j;

      }

      j = map_i - map_w - 1;

      for(i = 0; i < map_w; ++i, ++j) {

        map[j] = 0;

      }
      // path following
      while(stack_i > 0) {

        map_i = stack[--stack_i];

        map_i -= map_w+1;

        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }

        map_i += 1;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }
        map_i += 1;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }
        map_i += map_w;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }
        map_i -= 2;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }
        map_i += map_w;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }
        map_i += 1;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }
        map_i += 1;
        if ( map[map_i] === 1 ) {

          map[map_i] = 2;
          stack[stack_i++] = map_i;

        }

      }

      map_i = map_w + 1;

      row0 = 0;

      for(i = 0; i < h; ++i, map_i+=map_w) {

        for(j = 0; j < w; ++j) {

          dst_d[row0++] = (map[map_i+j] === 2) * 0xff;

        }

      }

      // free buffers
      Cache.putBuffer(dxdy_node);
      Cache.putBuffer(buf_node);
      Cache.putBuffer(map_node);
      Cache.putBuffer(stack_node);

    };

    //
    /**
     * transform is 3x3 Matrix_t
     *
     * Applies a perspective transformation to an image using 3x3 Matrix. Single channel source only.
     *
     * To avoid sampling artifacts, the mapping is done in the reverse order, from destination to the source. That is, for each pixel of the destination image, the functions compute coordinates of the corresponding “donor” pixel in the source image and copy the pixel value.
     *
     * @method perspective
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {Matrix_t} transform
     * @param {number=0} [fill_value]
     */
    Processing.perspective = function ( src, dst, transform, fill_value ) {

      if (typeof fill_value === "undefined") { fill_value = 0; }

      var src_width=src.cols|0, src_height=src.rows|0, dst_width=dst.cols|0, dst_height=dst.rows|0;
      var src_d=src.data, dst_d=dst.data;
      var x=0,y=0,off=0,ixs=0,iys=0,xs=0.0,ys=0.0,xs0=0.0,ys0=0.0,ws=0.0,sc=0.0,a=0.0,b=0.0,p0=0.0,p1=0.0;
      var td=transform.data;
      var
        m00=td[0],m01=td[1],m02=td[2],
        m10=td[3],m11=td[4],m12=td[5],
        m20=td[6],m21=td[7],m22=td[8];

      var dptr;

      for( dptr = 0; y < dst_height; ++y ) {

        xs0 = m01 * y + m02;
        ys0 = m11 * y + m12;
        ws  = m21 * y + m22;

        for(x = 0; x < dst_width; ++x, ++dptr, xs0+=m00, ys0+=m10, ws+=m20) {

          sc = 1.0 / ws;
          xs = xs0 * sc;
          ys = ys0 * sc;
          ixs = xs | 0;
          iys = ys | 0;

          if(xs > 0 && ys > 0 && ixs < (src_width - 1) && iys < (src_height - 1)) {

            a = Math.max(xs - ixs, 0.0);
            b = Math.max(ys - iys, 0.0);
            off = (src_width*iys + ixs)|0;

            p0 = src_d[off] +  a * (src_d[off+1] - src_d[off]);
            p1 = src_d[off+src_width] + a * (src_d[off+src_width+1] - src_d[off+src_width]);

            dst_d[dptr] = p0 + b * (p1 - p0);

          } else {

            dst_d[dptr] = fill_value;

          }

        }

      }

    };
    /**
     * @deprecated instead use perspective
     * @method warp_perspective
     * @static
     * @param src
     * @param dst
     * @param transform
     * @param fill_value
     */
    Processing.warp_perspective = function ( src, dst, transform, fill_value ) {

      Processing.perspective( src, dst, transform, fill_value );

    };

    /**
     * transform is 3x3 or 2x3 matrix_t only first 6 values referenced
     *
     * Applies an affine transformation to an image using 2x3 or 3x3 Matrix. Single channel source only.
     *
     * To avoid sampling artifacts, the mapping is done in the reverse order, from destination to the source. That is, for each pixel of the destination image, the functions compute coordinates of the corresponding “donor” pixel in the source image and copy the pixel value.
     *
     * @method affine
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     * @param {Matrix_t} transform
     * @param {number=0} [fill_value]
     */
    Processing.affine = function ( src, dst, transform, fill_value ) {

      if (typeof fill_value === "undefined") { fill_value = 0; }

      var src_width=src.cols, src_height=src.rows, dst_width=dst.cols, dst_height=dst.rows;
      var src_d=src.data, dst_d=dst.data;
      var x=0,y=0,off=0,ixs=0,iys=0,xs=0.0,ys=0.0,a=0.0,b=0.0,p0=0.0,p1=0.0;
      var td=transform.data;
      var m00=td[0],m01=td[1],m02=td[2],
        m10=td[3],m11=td[4],m12=td[5];
      var dptr;

      for( dptr = 0; y < dst_height; ++y ) {

        xs = m01 * y + m02;
        ys = m11 * y + m12;

        for(x = 0; x < dst_width; ++x, ++dptr, xs+=m00, ys+=m10) {

          ixs = xs | 0; iys = ys | 0;

          if(ixs >= 0 && iys >= 0 && ixs < (src_width - 1) && iys < (src_height - 1)) {

            a = xs - ixs;
            b = ys - iys;
            off = src_width*iys + ixs;

            p0 = src_d[off] +  a * (src_d[off+1] - src_d[off]);
            p1 = src_d[off+src_width] + a * (src_d[off+src_width+1] - src_d[off+src_width]);

            dst_d[dptr] = p0 + b * (p1 - p0);

          } else {

            dst_d[dptr] = fill_value;

          }

        }

      }

    };
    /**
     * @deprecated instead use affine
     * @method warp_affine
     * @static
     * @param src
     * @param dst
     * @param transform
     * @param fill_value
     */
    Processing.warp_affine = function ( src, dst, transform, fill_value ) {

      Processing.affine( src, dst, transform, fill_value );

    };

    /**
     * Basic RGB Skin detection filter
     *
     * from http://popscan.blogspot.fr/2012/08/skin-detection-in-digital-images.html
     *
     * @method skinDetector
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} dst
     */
    Processing.skinDetector = function ( src, dst ) {

      var r,g,b,j;
      var i = src.width*src.height;

      while(i--){

        j = i*4;
        r = src.data[j];
        g = src.data[j+1];
        b = src.data[j+2];

        if((r>95)&&(g>40)&&(b>20) &&
            (r>g)&&(r>b) &&
            (r-Math.min(g,b)>15) &&
            (Math.abs(r-g)>15)) {

          dst[i] = 255;

        } else {

          dst[i] = 0;

        }

      }

    };
    /**
     * @deprecated instead use skinDetector
     * @method skindetector
     * @static
     * @param src
     * @param dst
     */
    Processing.skindetector = function ( src, dst ) {

      Processing.skinDetector( src, dst );

    };

    return Processing;

  }() );

  // ----------------------------------------------------------------------

  //
  var Pyramid_t = ( function () {

    /**
     * A structure to wrap several matrix_t instances. Each data entry is 2x smaller then previous:
     *
     * @class Pyramid_t
     * @param {number} levels
     * @constructor
     */
    function Pyramid_t ( levels ) {

      /**
       * @property levels
       * @type {number}
       */
      this.levels = levels|0;
      /**
       * @property data
       * @type {Array}
       */
      this.data = new Array( levels );
      /**
       * @property pyrdown
       * @type {Function|*}
       */
      this.pyrdown = Processing.pyrdown;

    }

    var p = Pyramid_t.prototype;
    p.constructor = Pyramid_t;
    /**
     * @method allocate
     * @param {number} start_w
     * @param {number} start_h
     * @param {number} data_type
     */
    p.allocate = function ( start_w, start_h, data_type ) {

      var i = this.levels;

      while( --i >= 0 ) {

        this.data[i] = new Matrix_t(start_w >> i, start_h >> i, data_type);

      }

    };

    /**
     * @method build
     * @param {Matrix_t} input
     * @param {boolean=true} [skip_first_level]
     */
    p.build = function ( input, skip_first_level ) {

      if (typeof skip_first_level === "undefined") { skip_first_level = true; }

      // just copy data to first level
      var levels = this.levels;
      var data = this.data;
      var i = 2, a = input, b = data[0];

      if(!skip_first_level) {

        var j=input.cols*input.rows;

        while(--j >= 0) {

          b.data[j] = input.data[j];

        }

      }

      b = this.data[1];

      this.pyrdown(a, b);

      for(; i < levels; ++i) {

        a = b;
        b = data[i];
        this.pyrdown(a, b);

      }

    };

    return Pyramid_t;

  }() );

  global.Processing = Processing;
  global.Pyramid_t = Pyramid_t;

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/09 - 19:35
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
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  var U8_t = global.U8_t;
  //var Calc = global.Calc;
  var Matrix_t = global.Matrix_t;
  var Processing = global.Processing;

  global.Orb = ( function () {

    /**
     * @property bit_pattern_31_
     * @static
     * @type {Int32Array}
     * @private
     */
    var bit_pattern_31_ = new Int32Array([
      8,-3, 9,5/*mean (0), correlation (0)*/,
      4,2, 7,-12/*mean (1.12461e-05), correlation (0.0437584)*/,
      -11,9, -8,2/*mean (3.37382e-05), correlation (0.0617409)*/,
      7,-12, 12,-13/*mean (5.62303e-05), correlation (0.0636977)*/,
      2,-13, 2,12/*mean (0.000134953), correlation (0.085099)*/,
      1,-7, 1,6/*mean (0.000528565), correlation (0.0857175)*/,
      -2,-10, -2,-4/*mean (0.0188821), correlation (0.0985774)*/,
      -13,-13, -11,-8/*mean (0.0363135), correlation (0.0899616)*/,
      -13,-3, -12,-9/*mean (0.121806), correlation (0.099849)*/,
      10,4, 11,9/*mean (0.122065), correlation (0.093285)*/,
      -13,-8, -8,-9/*mean (0.162787), correlation (0.0942748)*/,
      -11,7, -9,12/*mean (0.21561), correlation (0.0974438)*/,
      7,7, 12,6/*mean (0.160583), correlation (0.130064)*/,
      -4,-5, -3,0/*mean (0.228171), correlation (0.132998)*/,
      -13,2, -12,-3/*mean (0.00997526), correlation (0.145926)*/,
      -9,0, -7,5/*mean (0.198234), correlation (0.143636)*/,
      12,-6, 12,-1/*mean (0.0676226), correlation (0.16689)*/,
      -3,6, -2,12/*mean (0.166847), correlation (0.171682)*/,
      -6,-13, -4,-8/*mean (0.101215), correlation (0.179716)*/,
      11,-13, 12,-8/*mean (0.200641), correlation (0.192279)*/,
      4,7, 5,1/*mean (0.205106), correlation (0.186848)*/,
      5,-3, 10,-3/*mean (0.234908), correlation (0.192319)*/,
      3,-7, 6,12/*mean (0.0709964), correlation (0.210872)*/,
      -8,-7, -6,-2/*mean (0.0939834), correlation (0.212589)*/,
      -2,11, -1,-10/*mean (0.127778), correlation (0.20866)*/,
      -13,12, -8,10/*mean (0.14783), correlation (0.206356)*/,
      -7,3, -5,-3/*mean (0.182141), correlation (0.198942)*/,
      -4,2, -3,7/*mean (0.188237), correlation (0.21384)*/,
      -10,-12, -6,11/*mean (0.14865), correlation (0.23571)*/,
      5,-12, 6,-7/*mean (0.222312), correlation (0.23324)*/,
      5,-6, 7,-1/*mean (0.229082), correlation (0.23389)*/,
      1,0, 4,-5/*mean (0.241577), correlation (0.215286)*/,
      9,11, 11,-13/*mean (0.00338507), correlation (0.251373)*/,
      4,7, 4,12/*mean (0.131005), correlation (0.257622)*/,
      2,-1, 4,4/*mean (0.152755), correlation (0.255205)*/,
      -4,-12, -2,7/*mean (0.182771), correlation (0.244867)*/,
      -8,-5, -7,-10/*mean (0.186898), correlation (0.23901)*/,
      4,11, 9,12/*mean (0.226226), correlation (0.258255)*/,
      0,-8, 1,-13/*mean (0.0897886), correlation (0.274827)*/,
      -13,-2, -8,2/*mean (0.148774), correlation (0.28065)*/,
      -3,-2, -2,3/*mean (0.153048), correlation (0.283063)*/,
      -6,9, -4,-9/*mean (0.169523), correlation (0.278248)*/,
      8,12, 10,7/*mean (0.225337), correlation (0.282851)*/,
      0,9, 1,3/*mean (0.226687), correlation (0.278734)*/,
      7,-5, 11,-10/*mean (0.00693882), correlation (0.305161)*/,
      -13,-6, -11,0/*mean (0.0227283), correlation (0.300181)*/,
      10,7, 12,1/*mean (0.125517), correlation (0.31089)*/,
      -6,-3, -6,12/*mean (0.131748), correlation (0.312779)*/,
      10,-9, 12,-4/*mean (0.144827), correlation (0.292797)*/,
      -13,8, -8,-12/*mean (0.149202), correlation (0.308918)*/,
      -13,0, -8,-4/*mean (0.160909), correlation (0.310013)*/,
      3,3, 7,8/*mean (0.177755), correlation (0.309394)*/,
      5,7, 10,-7/*mean (0.212337), correlation (0.310315)*/,
      -1,7, 1,-12/*mean (0.214429), correlation (0.311933)*/,
      3,-10, 5,6/*mean (0.235807), correlation (0.313104)*/,
      2,-4, 3,-10/*mean (0.00494827), correlation (0.344948)*/,
      -13,0, -13,5/*mean (0.0549145), correlation (0.344675)*/,
      -13,-7, -12,12/*mean (0.103385), correlation (0.342715)*/,
      -13,3, -11,8/*mean (0.134222), correlation (0.322922)*/,
      -7,12, -4,7/*mean (0.153284), correlation (0.337061)*/,
      6,-10, 12,8/*mean (0.154881), correlation (0.329257)*/,
      -9,-1, -7,-6/*mean (0.200967), correlation (0.33312)*/,
      -2,-5, 0,12/*mean (0.201518), correlation (0.340635)*/,
      -12,5, -7,5/*mean (0.207805), correlation (0.335631)*/,
      3,-10, 8,-13/*mean (0.224438), correlation (0.34504)*/,
      -7,-7, -4,5/*mean (0.239361), correlation (0.338053)*/,
      -3,-2, -1,-7/*mean (0.240744), correlation (0.344322)*/,
      2,9, 5,-11/*mean (0.242949), correlation (0.34145)*/,
      -11,-13, -5,-13/*mean (0.244028), correlation (0.336861)*/,
      -1,6, 0,-1/*mean (0.247571), correlation (0.343684)*/,
      5,-3, 5,2/*mean (0.000697256), correlation (0.357265)*/,
      -4,-13, -4,12/*mean (0.00213675), correlation (0.373827)*/,
      -9,-6, -9,6/*mean (0.0126856), correlation (0.373938)*/,
      -12,-10, -8,-4/*mean (0.0152497), correlation (0.364237)*/,
      10,2, 12,-3/*mean (0.0299933), correlation (0.345292)*/,
      7,12, 12,12/*mean (0.0307242), correlation (0.366299)*/,
      -7,-13, -6,5/*mean (0.0534975), correlation (0.368357)*/,
      -4,9, -3,4/*mean (0.099865), correlation (0.372276)*/,
      7,-1, 12,2/*mean (0.117083), correlation (0.364529)*/,
      -7,6, -5,1/*mean (0.126125), correlation (0.369606)*/,
      -13,11, -12,5/*mean (0.130364), correlation (0.358502)*/,
      -3,7, -2,-6/*mean (0.131691), correlation (0.375531)*/,
      7,-8, 12,-7/*mean (0.160166), correlation (0.379508)*/,
      -13,-7, -11,-12/*mean (0.167848), correlation (0.353343)*/,
      1,-3, 12,12/*mean (0.183378), correlation (0.371916)*/,
      2,-6, 3,0/*mean (0.228711), correlation (0.371761)*/,
      -4,3, -2,-13/*mean (0.247211), correlation (0.364063)*/,
      -1,-13, 1,9/*mean (0.249325), correlation (0.378139)*/,
      7,1, 8,-6/*mean (0.000652272), correlation (0.411682)*/,
      1,-1, 3,12/*mean (0.00248538), correlation (0.392988)*/,
      9,1, 12,6/*mean (0.0206815), correlation (0.386106)*/,
      -1,-9, -1,3/*mean (0.0364485), correlation (0.410752)*/,
      -13,-13, -10,5/*mean (0.0376068), correlation (0.398374)*/,
      7,7, 10,12/*mean (0.0424202), correlation (0.405663)*/,
      12,-5, 12,9/*mean (0.0942645), correlation (0.410422)*/,
      6,3, 7,11/*mean (0.1074), correlation (0.413224)*/,
      5,-13, 6,10/*mean (0.109256), correlation (0.408646)*/,
      2,-12, 2,3/*mean (0.131691), correlation (0.416076)*/,
      3,8, 4,-6/*mean (0.165081), correlation (0.417569)*/,
      2,6, 12,-13/*mean (0.171874), correlation (0.408471)*/,
      9,-12, 10,3/*mean (0.175146), correlation (0.41296)*/,
      -8,4, -7,9/*mean (0.183682), correlation (0.402956)*/,
      -11,12, -4,-6/*mean (0.184672), correlation (0.416125)*/,
      1,12, 2,-8/*mean (0.191487), correlation (0.386696)*/,
      6,-9, 7,-4/*mean (0.192668), correlation (0.394771)*/,
      2,3, 3,-2/*mean (0.200157), correlation (0.408303)*/,
      6,3, 11,0/*mean (0.204588), correlation (0.411762)*/,
      3,-3, 8,-8/*mean (0.205904), correlation (0.416294)*/,
      7,8, 9,3/*mean (0.213237), correlation (0.409306)*/,
      -11,-5, -6,-4/*mean (0.243444), correlation (0.395069)*/,
      -10,11, -5,10/*mean (0.247672), correlation (0.413392)*/,
      -5,-8, -3,12/*mean (0.24774), correlation (0.411416)*/,
      -10,5, -9,0/*mean (0.00213675), correlation (0.454003)*/,
      8,-1, 12,-6/*mean (0.0293635), correlation (0.455368)*/,
      4,-6, 6,-11/*mean (0.0404971), correlation (0.457393)*/,
      -10,12, -8,7/*mean (0.0481107), correlation (0.448364)*/,
      4,-2, 6,7/*mean (0.050641), correlation (0.455019)*/,
      -2,0, -2,12/*mean (0.0525978), correlation (0.44338)*/,
      -5,-8, -5,2/*mean (0.0629667), correlation (0.457096)*/,
      7,-6, 10,12/*mean (0.0653846), correlation (0.445623)*/,
      -9,-13, -8,-8/*mean (0.0858749), correlation (0.449789)*/,
      -5,-13, -5,-2/*mean (0.122402), correlation (0.450201)*/,
      8,-8, 9,-13/*mean (0.125416), correlation (0.453224)*/,
      -9,-11, -9,0/*mean (0.130128), correlation (0.458724)*/,
      1,-8, 1,-2/*mean (0.132467), correlation (0.440133)*/,
      7,-4, 9,1/*mean (0.132692), correlation (0.454)*/,
      -2,1, -1,-4/*mean (0.135695), correlation (0.455739)*/,
      11,-6, 12,-11/*mean (0.142904), correlation (0.446114)*/,
      -12,-9, -6,4/*mean (0.146165), correlation (0.451473)*/,
      3,7, 7,12/*mean (0.147627), correlation (0.456643)*/,
      5,5, 10,8/*mean (0.152901), correlation (0.455036)*/,
      0,-4, 2,8/*mean (0.167083), correlation (0.459315)*/,
      -9,12, -5,-13/*mean (0.173234), correlation (0.454706)*/,
      0,7, 2,12/*mean (0.18312), correlation (0.433855)*/,
      -1,2, 1,7/*mean (0.185504), correlation (0.443838)*/,
      5,11, 7,-9/*mean (0.185706), correlation (0.451123)*/,
      3,5, 6,-8/*mean (0.188968), correlation (0.455808)*/,
      -13,-4, -8,9/*mean (0.191667), correlation (0.459128)*/,
      -5,9, -3,-3/*mean (0.193196), correlation (0.458364)*/,
      -4,-7, -3,-12/*mean (0.196536), correlation (0.455782)*/,
      6,5, 8,0/*mean (0.1972), correlation (0.450481)*/,
      -7,6, -6,12/*mean (0.199438), correlation (0.458156)*/,
      -13,6, -5,-2/*mean (0.211224), correlation (0.449548)*/,
      1,-10, 3,10/*mean (0.211718), correlation (0.440606)*/,
      4,1, 8,-4/*mean (0.213034), correlation (0.443177)*/,
      -2,-2, 2,-13/*mean (0.234334), correlation (0.455304)*/,
      2,-12, 12,12/*mean (0.235684), correlation (0.443436)*/,
      -2,-13, 0,-6/*mean (0.237674), correlation (0.452525)*/,
      4,1, 9,3/*mean (0.23962), correlation (0.444824)*/,
      -6,-10, -3,-5/*mean (0.248459), correlation (0.439621)*/,
      -3,-13, -1,1/*mean (0.249505), correlation (0.456666)*/,
      7,5, 12,-11/*mean (0.00119208), correlation (0.495466)*/,
      4,-2, 5,-7/*mean (0.00372245), correlation (0.484214)*/,
      -13,9, -9,-5/*mean (0.00741116), correlation (0.499854)*/,
      7,1, 8,6/*mean (0.0208952), correlation (0.499773)*/,
      7,-8, 7,6/*mean (0.0220085), correlation (0.501609)*/,
      -7,-4, -7,1/*mean (0.0233806), correlation (0.496568)*/,
      -8,11, -7,-8/*mean (0.0236505), correlation (0.489719)*/,
      -13,6, -12,-8/*mean (0.0268781), correlation (0.503487)*/,
      2,4, 3,9/*mean (0.0323324), correlation (0.501938)*/,
      10,-5, 12,3/*mean (0.0399235), correlation (0.494029)*/,
      -6,-5, -6,7/*mean (0.0420153), correlation (0.486579)*/,
      8,-3, 9,-8/*mean (0.0548021), correlation (0.484237)*/,
      2,-12, 2,8/*mean (0.0616622), correlation (0.496642)*/,
      -11,-2, -10,3/*mean (0.0627755), correlation (0.498563)*/,
      -12,-13, -7,-9/*mean (0.0829622), correlation (0.495491)*/,
      -11,0, -10,-5/*mean (0.0843342), correlation (0.487146)*/,
      5,-3, 11,8/*mean (0.0929937), correlation (0.502315)*/,
      -2,-13, -1,12/*mean (0.113327), correlation (0.48941)*/,
      -1,-8, 0,9/*mean (0.132119), correlation (0.467268)*/,
      -13,-11, -12,-5/*mean (0.136269), correlation (0.498771)*/,
      -10,-2, -10,11/*mean (0.142173), correlation (0.498714)*/,
      -3,9, -2,-13/*mean (0.144141), correlation (0.491973)*/,
      2,-3, 3,2/*mean (0.14892), correlation (0.500782)*/,
      -9,-13, -4,0/*mean (0.150371), correlation (0.498211)*/,
      -4,6, -3,-10/*mean (0.152159), correlation (0.495547)*/,
      -4,12, -2,-7/*mean (0.156152), correlation (0.496925)*/,
      -6,-11, -4,9/*mean (0.15749), correlation (0.499222)*/,
      6,-3, 6,11/*mean (0.159211), correlation (0.503821)*/,
      -13,11, -5,5/*mean (0.162427), correlation (0.501907)*/,
      11,11, 12,6/*mean (0.16652), correlation (0.497632)*/,
      7,-5, 12,-2/*mean (0.169141), correlation (0.484474)*/,
      -1,12, 0,7/*mean (0.169456), correlation (0.495339)*/,
      -4,-8, -3,-2/*mean (0.171457), correlation (0.487251)*/,
      -7,1, -6,7/*mean (0.175), correlation (0.500024)*/,
      -13,-12, -8,-13/*mean (0.175866), correlation (0.497523)*/,
      -7,-2, -6,-8/*mean (0.178273), correlation (0.501854)*/,
      -8,5, -6,-9/*mean (0.181107), correlation (0.494888)*/,
      -5,-1, -4,5/*mean (0.190227), correlation (0.482557)*/,
      -13,7, -8,10/*mean (0.196739), correlation (0.496503)*/,
      1,5, 5,-13/*mean (0.19973), correlation (0.499759)*/,
      1,0, 10,-13/*mean (0.204465), correlation (0.49873)*/,
      9,12, 10,-1/*mean (0.209334), correlation (0.49063)*/,
      5,-8, 10,-9/*mean (0.211134), correlation (0.503011)*/,
      -1,11, 1,-13/*mean (0.212), correlation (0.499414)*/,
      -9,-3, -6,2/*mean (0.212168), correlation (0.480739)*/,
      -1,-10, 1,12/*mean (0.212731), correlation (0.502523)*/,
      -13,1, -8,-10/*mean (0.21327), correlation (0.489786)*/,
      8,-11, 10,-6/*mean (0.214159), correlation (0.488246)*/,
      2,-13, 3,-6/*mean (0.216993), correlation (0.50287)*/,
      7,-13, 12,-9/*mean (0.223639), correlation (0.470502)*/,
      -10,-10, -5,-7/*mean (0.224089), correlation (0.500852)*/,
      -10,-8, -8,-13/*mean (0.228666), correlation (0.502629)*/,
      4,-6, 8,5/*mean (0.22906), correlation (0.498305)*/,
      3,12, 8,-13/*mean (0.233378), correlation (0.503825)*/,
      -4,2, -3,-3/*mean (0.234323), correlation (0.476692)*/,
      5,-13, 10,-12/*mean (0.236392), correlation (0.475462)*/,
      4,-13, 5,-1/*mean (0.236842), correlation (0.504132)*/,
      -9,9, -4,3/*mean (0.236977), correlation (0.497739)*/,
      0,3, 3,-9/*mean (0.24314), correlation (0.499398)*/,
      -12,1, -6,1/*mean (0.243297), correlation (0.489447)*/,
      3,2, 4,-8/*mean (0.00155196), correlation (0.553496)*/,
      -10,-10, -10,9/*mean (0.00239541), correlation (0.54297)*/,
      8,-13, 12,12/*mean (0.0034413), correlation (0.544361)*/,
      -8,-12, -6,-5/*mean (0.003565), correlation (0.551225)*/,
      2,2, 3,7/*mean (0.00835583), correlation (0.55285)*/,
      10,6, 11,-8/*mean (0.00885065), correlation (0.540913)*/,
      6,8, 8,-12/*mean (0.0101552), correlation (0.551085)*/,
      -7,10, -6,5/*mean (0.0102227), correlation (0.533635)*/,
      -3,-9, -3,9/*mean (0.0110211), correlation (0.543121)*/,
      -1,-13, -1,5/*mean (0.0113473), correlation (0.550173)*/,
      -3,-7, -3,4/*mean (0.0140913), correlation (0.554774)*/,
      -8,-2, -8,3/*mean (0.017049), correlation (0.55461)*/,
      4,2, 12,12/*mean (0.01778), correlation (0.546921)*/,
      2,-5, 3,11/*mean (0.0224022), correlation (0.549667)*/,
      6,-9, 11,-13/*mean (0.029161), correlation (0.546295)*/,
      3,-1, 7,12/*mean (0.0303081), correlation (0.548599)*/,
      11,-1, 12,4/*mean (0.0355151), correlation (0.523943)*/,
      -3,0, -3,6/*mean (0.0417904), correlation (0.543395)*/,
      4,-11, 4,12/*mean (0.0487292), correlation (0.542818)*/,
      2,-4, 2,1/*mean (0.0575124), correlation (0.554888)*/,
      -10,-6, -8,1/*mean (0.0594242), correlation (0.544026)*/,
      -13,7, -11,1/*mean (0.0597391), correlation (0.550524)*/,
      -13,12, -11,-13/*mean (0.0608974), correlation (0.55383)*/,
      6,0, 11,-13/*mean (0.065126), correlation (0.552006)*/,
      0,-1, 1,4/*mean (0.074224), correlation (0.546372)*/,
      -13,3, -9,-2/*mean (0.0808592), correlation (0.554875)*/,
      -9,8, -6,-3/*mean (0.0883378), correlation (0.551178)*/,
      -13,-6, -8,-2/*mean (0.0901035), correlation (0.548446)*/,
      5,-9, 8,10/*mean (0.0949843), correlation (0.554694)*/,
      2,7, 3,-9/*mean (0.0994152), correlation (0.550979)*/,
      -1,-6, -1,-1/*mean (0.10045), correlation (0.552714)*/,
      9,5, 11,-2/*mean (0.100686), correlation (0.552594)*/,
      11,-3, 12,-8/*mean (0.101091), correlation (0.532394)*/,
      3,0, 3,5/*mean (0.101147), correlation (0.525576)*/,
      -1,4, 0,10/*mean (0.105263), correlation (0.531498)*/,
      3,-6, 4,5/*mean (0.110785), correlation (0.540491)*/,
      -13,0, -10,5/*mean (0.112798), correlation (0.536582)*/,
      5,8, 12,11/*mean (0.114181), correlation (0.555793)*/,
      8,9, 9,-6/*mean (0.117431), correlation (0.553763)*/,
      7,-4, 8,-12/*mean (0.118522), correlation (0.553452)*/,
      -10,4, -10,9/*mean (0.12094), correlation (0.554785)*/,
      7,3, 12,4/*mean (0.122582), correlation (0.555825)*/,
      9,-7, 10,-2/*mean (0.124978), correlation (0.549846)*/,
      7,0, 12,-2/*mean (0.127002), correlation (0.537452)*/,
      -1,-6, 0,-11/*mean (0.127148), correlation (0.547401)*/
    ]);

    /**
     * @property H
     * @static
     * @private
     *
     * @type {Matrix_t|*}
     */
    var H = new Matrix_t(3, 3, Igata.F32_t|Igata.C1_t);
    /**
     * @property patch_img
     * @static
     * @private
     *
     * @type {Matrix_t|*}
     */
    var patch_img = new Matrix_t(32, 32, U8_t|Igata.C1_t);

    /**
     * @method rectify_patch
     * @static
     * @private
     *
     * @param src
     * @param dst
     * @param angle
     * @param px
     * @param py
     * @param psize
     */
    function rectify_patch ( src, dst, angle, px, py, psize ) {

      var cosine = Math.cos(angle);
      var sine   = Math.sin(angle);

      H.data[0] = cosine;
      H.data[1] = -sine;
      H.data[2] = (-cosine + sine  ) * psize*0.5 + px;
      H.data[3] = sine;
      H.data[4] =  cosine;
      H.data[5] = (-sine   - cosine) * psize*0.5 + py;

      Processing.affine(src, dst, H, 128);

    }

    /**
     * @class Orb
     * @static
     * @constructor
     */
    function Orb () {
      throw new Error( 'Orb can\'t create instance.' );
    }

    var p = Orb.prototype;
    p.constructor = Orb;

    /**
     * @method describe
     * @static
     *
     * @param {Matrix_t} src
     * @param {Matrix_t} corners
     * @param {number} count
     * @param {Matrix_t} descriptors
     */
    Orb.describe = function ( src, corners, count, descriptors ) {

      var DESCR_SIZE = 32; // bytes;
      var i=0,b=0,px=0.0,py=0.0,angle=0.0;
      var t0=0, t1=0, val=0;
      var img = src.data, w = src.cols, h = src.rows;
      var patch_d = patch_img.data;
      var patch_off = 16*32 + 16; // center of patch
      var patt=0;

      if(!(descriptors.type&U8_t)) {

        // relocate to U8 type
        descriptors.type = U8_t;
        descriptors.cols = DESCR_SIZE;
        descriptors.rows = count;
        descriptors.channel = 1;
        descriptors.allocate();

      } else {

        descriptors.resize(DESCR_SIZE, count, 1);

      }

      var descr_d = descriptors.data;
      var descr_off = 0;

      for(i = 0; i < count; ++i) {

        px = corners[i].x;
        py = corners[i].y;
        angle = corners[i].angle;

        rectify_patch(src, patch_img, angle, px, py, 32);

        // describe the patch
        patt = 0;

        for (b = 0; b < DESCR_SIZE; ++b) {

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val = (t0 < t1)|0;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 1;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 2;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 3;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 4;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 5;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 6;

          t0 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          t1 = patch_d[patch_off + bit_pattern_31_[patt+1] * 32 + bit_pattern_31_[patt]]; patt += 2;
          val |= (t0 < t1) << 7;

          descr_d[descr_off+b] = val;

        }

        descr_off += DESCR_SIZE;

      }

    };

    return Orb;

  }() );

}( window ) );