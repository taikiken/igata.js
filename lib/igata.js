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
 * build 2015-09-11 20:03:30
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

  global._log = Math.log;

  global._pow = Math.pow;

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

  ///**
  // * Cascade files
  // * @module Cascade
  // * @type {{}}
  // */
  //global.Cascade = {};

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
     *
     *      [
     *        1, 1,   1,
     *        1, 0.7,-1,
     *        -1, -1,-1
     *        ]
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
     * @param {number=0.1111111} [k]
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
// * date 15/09/11 - 15:19
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

  global.Cascade = ( function () {

    /**
     * cascade files parent Class.
     *
     *
     * @class Cascade
     * @static
     * @constructor
     */
    function Cascade () {
      throw new Error( 'Cascade can\'t create instance.' );
    }

    var p = Cascade.prototype;
    p.constructor = Cascade;

    return Cascade;

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
     * @param {number=-1.0} [angle]
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
     * @method resize
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
      /**
       * @for Cache
       * @property _pool_head
       * @static
       * @type {Node_t}
       * @default undefined
       * @private
       */
      _pool_head,
      /**
       * @for Cache
       * @property _pool_tail
       * @static
       * @type {Node_t}
       * @default undefined
       * @private
       */
      _pool_tail;

    /**
     * @for Cache
     * @property _pool_size
     * @static
     * @type {number}
     * @default 0
     * @private
     */
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
     * default allocate が設定されています
     *
     *      //default allocate
     *      Cache.allocate(30, 640*4);
     *
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
    Igata = window.Igata,
    global = Igata;

  global.Calc = ( function () {

    var
      Cache = global.Cache;

    var
      U8_t = global.U8_t;

    /**
     * @for Calc
     * @property qsort_stack
     * @static
     * @private
     * @type {Int32Array}
     */
    var qsort_stack = new Int32Array(48*2);

    var _exp = global._exp;
    var _min = global._min;

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

      if ((size&1) === 1 && size <= 7 && sigma <= 0) {

        switch (size>>1) {

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
          t = _exp(scale_2x*x*x);

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

      if ( (high-low+1) <= 1 ) { return; }

      stack[0] = low;
      stack[1] = high;

      while ( sp >= 0 ) {

        left = stack[sp<<1];
        right = stack[(sp<<1)+1];
        sp--;

        for (;;) {

          n = (right - left) + 1;

          if ( n <= isort_thresh ) {

            //insert_sort:
            for( ptr = left + 1; ptr <= right; ptr++ ) {

              for( ptr2 = ptr; ptr2 > left && cmp(array[ptr2],array[ptr2-1]); ptr2-- ) {

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

            for (;;) {

              while ( left <= right && !cmp(ta, array[left]) ) {

                if ( !cmp(array[left], ta) ) {

                  if ( left > left1 ) {

                    t = array[left1];
                    array[left1] = array[left];
                    array[left] = t;

                  }

                  swap_cnt = 1;
                  left1++;

                }

                left++;

              }

              while ( left <= right && !cmp(array[right], ta) ) {

                if ( !cmp(ta, array[right]) ) {

                  if ( right < right1 ) {

                    t = array[right1];
                    array[right1] = array[right];
                    array[right] = t;

                  }

                  swap_cnt = 1;
                  right1--;

                }

                right--;

              }

              if ( left > right ) { break; }

              t = array[left];
              array[left] = array[right];
              array[right] = t;
              swap_cnt = 1;
              left++;
              right--;

            }

            if ( swap_cnt === 0 ) {

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

            n = _min( (left1 - left0), (left - left1) );
            m = (left-n)|0;

            for( i = 0; i < n; ++i,++m ) {

              t = array[left0+i];
              array[left0+i] = array[m];
              array[m] = t;

            }

            n = _min( (right0 - right1), (right1 - right) );
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

      if ( typeof value === "undefined" ) { value=1; }

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


  var LinearAlgebra = ( function () {

    var Cache = global.Cache;
    var Matrix_t = global.Matrix_t;
    var MM = global.MM;

    var _abs = global._abs;
    var _sqrt = global._sqrt;
    var _max = global._max;

    // ---------------------------------------------------
    // private static method
    // ---------------------------------------------------

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

      a = _abs(a);
      b = _abs(b);

      if (  a > b ) {

        b /= a;
        return a*_sqrt(1.0 + b*b);

      }

      if (  b > 0 ) {

        a /= b;
        return b*_sqrt(1.0 + a*a);

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

          for (m = k+1, mv = _abs(A[astep*k + m]), i = k+2; i < n; i++) {

            val = _abs(A[astep*k+i]);

            if ( mv < val){

              mv = val;
              m = i;

            }

          }

          indR[k] = m;

        }

        if ( k > 0) {

          for (m = 0, mv = _abs(A[k]), i = 1; i < k; i++) {

            val = _abs(A[astep*i+k]);

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
          for (k = 0, mv = _abs(A[indR[0]]), i = 1; i < n-1; i++) {

            val = _abs(A[astep*i + indR[i]]);

            if (  mv < val ){

              mv = val;
              k = i;

            }

          }

          l = indR[k];

          for (i = 1; i < n; i++) {

            val = _abs(A[astep*indC[i] + i]);

            if (  mv < val ){

              mv = val;
              k = indC[i];
              l = i;

            }

          }

          p = A[astep*k + l];

          if ( _abs(p) <= eps ) {

            break;

          }

          y = (W[l] - W[k])*0.5;
          t = _abs(y) + hypot(p, y);
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

              for (m = idx+1, mv = _abs(A[astep*idx + m]), i = idx+2; i < n; i++) {

                val = _abs(A[astep*idx+i]);

                if (  mv < val ){

                  mv = val;
                  m = i;

                }

              }

              indR[idx] = m;

            }

            if ( idx > 0) {

              for (m = 0, mv = _abs(A[idx]), i = 1; i < idx; i++) {

                val = _abs(A[astep*i+idx]);

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
      var i=0,j=0,k=0,iter=0,max_iter=_max(m, 30);
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

            if ( _abs(p) <= eps*_sqrt(a*b) ) {

              continue;

            }

            p *= 2.0;
            beta = a - b;
            gamma = hypot(p, beta);

            if ( beta < 0 ) {

              delta = (gamma - beta)*0.5;
              s = _sqrt(delta/gamma);
              c = (p/(gamma*s*2.0));

            } else {

              c = _sqrt((gamma + beta)/(gamma*2.0));
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

        W[i] = _sqrt(sd);

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
                asum += _abs(t);

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

          sd = _sqrt(sd);

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
    // ---------------------------------------------------
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

        if ( _abs(ad[k*astep+i]) < Igata.EPSILON ) {

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

  // ---------------------------------------------------
  // private static method
  //function sqr (x) {
  //
  //  return x*x;
  //
  //}

  var Cache = global.Cache;
  var Matrix_t = global.Matrix_t;
  var MM = global.MM;
  var LA = global.LA;
  var Calc = global.Calc;

  var F32_t = global.F32_t;
  var C1_t = global.C1_t;
  var EPSILON = global.EPSILON;

  var _sqrt = global._sqrt;
  var _abs = global._abs;
  var _log = global._log;
  var _pow = global._pow;
  var _round = global._round;
  var _max = global._max;

  // private const
  /**
   * @for Affine2d
   * @property T0
   * @static
   * @private
   * @type {Matrix_t|*}
   */
  var T0  = new Matrix_t( 3, 3, F32_t|C1_t);
  /**
   * @for Affine2d
   * @property T1
   * @static
   * @private
   * @type {Matrix_t|*}
   */
  var T1  = new Matrix_t( 3, 3, F32_t|C1_t);
  /**
   * @for Affine2d
   * @property AtA
   * @static
   * @private
   * @type {Matrix_t|*}
   */
  var AtA = new Matrix_t( 6, 6, F32_t|C1_t);
  /**
   * @for Affine2d
   * @property AtB
   * @static
   * @private
   * @type {Matrix_t|*}
   */
  var AtB = new Matrix_t( 6, 1, F32_t|C1_t);
  /**
   * @for Affine2d
   * @property mLtL
   * @static
   * @private
   * @type {Matrix_t|*}
   */
  var mLtL = new Matrix_t(9, 9, F32_t|C1_t);
  /**
   * @for Affine2d
   * @property Evec
   * @static
   * @private
   * @type {Matrix_t|*}
   */
  var Evec = new Matrix_t(9, 9, F32_t|C1_t);


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
        d0 += _sqrt(dx*dx + dy*dy);
        dx = to[i].x - cx1;
        dy = to[i].y - cy1;
        d1 += _sqrt(dx*dx + dy*dy);

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

        smx += _abs(to[i].x - cmx);
        smy += _abs(to[i].y - cmy);
        sMx += _abs(from[i].x - cMx);
        sMy += _abs(from[i].y - cMy);

      }

      if ( _abs(smx) < EPSILON ||
           _abs(smy) < EPSILON ||
           _abs(sMx) < EPSILON ||
           _abs(sMy) < EPSILON ) {

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
     * RANdom SAmple Consensus.
     *
     * http://en.wikipedia.org/wiki/RANSAC
     *
     * @class Ransac_t
     * @param {number=0} [size]
     * @param {number=0.5} [thresh]
     * @param {number=0.5} [eps]
     * @param {number=0.99} [prob]
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

      var num = _log(1 - this.prob);
      var denom = _log(1 - _pow(1 - eps, this.size));

      return (denom >= 0 || -num >= max_iters*(-denom) ? max_iters : _round(num/denom))|0;

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

      for (; ssiter < max_try; ++ssiter) {

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

          if ( !kernel.check_subset( from_sub, to_sub, i+1 ) ) {

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

        if ( numinliers > _max(inliers_max, model_points-1) ) {

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
          //M.copy_to(model);
          M.copy(model);
          result = true;

        }

      }

      if(result) {

        sigma = 2.5*1.4826*(1 + 5.0/(count - model_points))*_sqrt(min_median);
        sigma = _max(sigma, 0.001);

        numinliers = find_inliers(kernel, model, from, to, count, sigma, err, curr_mask.data);
        //if (mask) { curr_mask.copy_to(mask); }
        if (mask) { curr_mask.copy(mask); }

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

  var _max = global._max;
  var _min = global._min;
  var _PI = global._PI;
  var _sin = global._sin;
  var _cos = global._cos;
  var _floor = global._floor;
  var _round = global._round;
  var _abs = global._abs;

  /**
   * @for Processing
   * @method _resample_u8
   * @static
   * @param src
   * @param dst
   * @param nw
   * @param nh
   * @private
   */
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

      sx1 = _min(sx1, w - 1);
      sx2 = _min(sx2, w - 1);

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

            dst_d[b+dx] = _min(_max((sum[dx] + buf[dx] * 256) / inv_scale_256, 0), 255);
            sum[dx] = buf[dx] = 0;

          }

        } else {

          for (dx = 0; dx < nw * ch; dx++) {

            dst_d[b+dx] = _min(_max((sum[dx] + buf[dx] * beta1) / inv_scale_256, 0), 255);
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
  /**
   * @for Processing
   * @method _resample
   * @static
   * @param src
   * @param dst
   * @param nw
   * @param nh
   * @private
   */
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

      if (sx1 > fsx1) {

        xofs_count++;
        xofs[k++] = ((sx1 - 1)*ch)|0;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = (sx1 - fsx1) * scale;

      }
      for (sx = sx1; sx < sx2; sx++){

        xofs_count++;
        xofs[k++] = (sx * ch)|0;
        xofs[k++] = (dx * ch)|0;
        xofs[k++] = scale;

      }

      if (fsx2 - sx2 > 1e-3) {

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

        for (dx = 0; dx < nw * ch; dx++) {

          sum[dx] += buf[dx];
          buf[dx] = 0;

        }

      }

    }

    Cache.putBuffer(sum_node);
    Cache.putBuffer(buf_node);
    Cache.putBuffer(xofs_node);

  }// _resample

  /**
   * @for Processing
   * @method _convol_u8
   * @static
   * @param buf
   * @param src_d
   * @param dst_d
   * @param w
   * @param h
   * @param filter
   * @param kernel_size
   * @param half_kernel
   * @private
   */
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
  /**
   * @for Processing
   * @method _convol
   * @static
   * @param buf
   * @param src_d
   * @param dst_d
   * @param w
   * @param h
   * @param filter
   * @param kernel_size
   * @param half_kernel
   * @private
   */
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

      if (code === COLOR_BGRA2GRAY || code === COLOR_BGR2GRAY) {

        coeff_r = 1868;
        coeff_b = 4899;

      }
      if (code === COLOR_RGB2GRAY || code === COLOR_BGR2GRAY) {

        cn = 3;

      }
      var cn2 = cn<<1, cn3 = (cn*3)|0;

      dst.resize(w, h, 1);
      var dst_u8 = dst.data;
      var limit;

      for (y = 0; y < h; ++y, j+=w, i+=w*cn) {

        for (x = 0, ir = i, jr = j, limit = w-4; x <= limit; x+=4, ir+=cn<<2, jr+=4) {

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

    /**
     * derived from CCV library
     *
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

        for (i = (srcIndex+1)|0, end=(srcIndex+radius)|0; i <= end; ++i) {

          sum += data_u8[i];

        }

        nextPixelIndex = (srcIndex + radiusPlusOne)|0;
        previousPixelIndex = srcIndex;
        hold = data_u8[previousPixelIndex];

        for (x = 0; x < radius; ++x, dstIndex += h) {

          data_i32[dstIndex] = sum;
          sum += data_u8[nextPixelIndex]- hold;
          nextPixelIndex ++;

        }

        for (; x < w-radiusPlus2; x+=2, dstIndex += h2) {

          data_i32[dstIndex] = sum;
          sum += data_u8[nextPixelIndex]- data_u8[previousPixelIndex];

          data_i32[dstIndex+h] = sum;
          sum += data_u8[nextPixelIndex+1]- data_u8[previousPixelIndex+1];

          nextPixelIndex +=2;
          previousPixelIndex +=2;

        }

        for (; x < w-radiusPlusOne; ++x, dstIndex += h) {

          data_i32[dstIndex] = sum;
          sum += data_u8[nextPixelIndex]- data_u8[previousPixelIndex];

          nextPixelIndex ++;
          previousPixelIndex ++;

        }

        hold = data_u8[nextPixelIndex-1];

        for (; x < w; ++x, dstIndex += h) {

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

          for (i = (srcIndex+1)|0, end=(srcIndex+radius)|0; i <= end; ++i) {

            sum += data_i32[i];

          }

          nextPixelIndex = srcIndex + radiusPlusOne;
          previousPixelIndex = srcIndex;
          hold = data_i32[previousPixelIndex];

          for (x = 0; x < radius; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum;
            sum += data_i32[nextPixelIndex]- hold;
            nextPixelIndex ++;

          }

          for (; x < h-radiusPlus2; x+=2, dstIndex += w2) {

            data_u8[dstIndex] = sum;
            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];

            data_u8[dstIndex+w] = sum;
            sum += data_i32[nextPixelIndex+1]- data_i32[previousPixelIndex+1];

            nextPixelIndex +=2;
            previousPixelIndex +=2;

          }

          for (; x < h-radiusPlusOne; ++x, dstIndex += w) {

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

          for (i = (srcIndex+1)|0, end=(srcIndex+radius)|0; i <= end; ++i) {

            sum += data_i32[i];

          }

          nextPixelIndex = srcIndex + radiusPlusOne;
          previousPixelIndex = srcIndex;
          hold = data_i32[previousPixelIndex];

          for (x = 0; x < radius; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum*scale;
            sum += data_i32[nextPixelIndex]- hold;
            nextPixelIndex ++;

          }

          for (; x < h-radiusPlus2; x+=2, dstIndex += w2) {

            data_u8[dstIndex] = sum*scale;
            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];

            data_u8[dstIndex+w] = sum*scale;
            sum += data_i32[nextPixelIndex+1]- data_i32[previousPixelIndex+1];

            nextPixelIndex +=2;
            previousPixelIndex +=2;

          }
          for (; x < h-radiusPlusOne; ++x, dstIndex += w) {

            data_u8[dstIndex] = sum*scale;

            sum += data_i32[nextPixelIndex]- data_i32[previousPixelIndex];
            nextPixelIndex ++;
            previousPixelIndex ++;

          }

          hold = data_i32[nextPixelIndex-1];

          for (; x < h; ++x, dstIndex += w) {

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

      if (is_u8) {

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
      var max_theta = _PI;

      var numangle = _round((max_theta - min_theta) / theta_res);
      var numrho = _round(((width + height) * 2 + 1) / rho_res);
      var irho = 1.0 / rho_res;

      var accum = new Int32Array((numangle+2) * (numrho+2)); //typed arrays are initialized to 0
      var tabSin = new Float32Array(numangle);
      var tabCos = new Float32Array(numangle);

      var n=0;
      var ang = min_theta;
      var r;

      for(; n < numangle; n++ ) {

        tabSin[n] = _sin(ang) * irho;
        tabCos[n] = _cos(ang) * irho;
        ang += theta_res;

      }

      // stage 1. fill accumulator
      var j;

      for ( i = 0; i < height; i++ ) {

        for ( j = 0; j < width; j++ ) {

          if ( image[i * step + j] !== 0 ) {

            //console.log(r, (n+1) * (numrho+2) + r+1, tabCos[n], tabSin[n]);
            for ( n = 0; n < numangle; n++ ) {

              r = _round( j * tabCos[n] + i * tabSin[n] );
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

      for ( r = 0; r < numrho; r++ ) {

        for ( n = 0; n < numangle; n++ ) {

          base = (n+1) * (numrho+2) + r+1;

          if ( accum[base] > threshold &&
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
      var linesMax = _min(numangle*numrho, _sort_buf.length);
      var scale = 1.0 / (numrho+2);
      //var lines = new Array();
      var lines = [];
      var
        idx, lrho, langle, i;

      for ( i = 0; i < linesMax; i++ ) {

        idx = _sort_buf[i];
        n = _floor(idx*scale) - 1;
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

      for (; y < h; ++y, srow1+=w) {

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

      if (src.type&U8_t || src.type&S32_t) {

        trow0 = buf0_node.i32;
        trow1 = buf1_node.i32;

      } else {

        trow0 = buf0_node.f32;
        trow1 = buf1_node.f32;

      }

      for (; y < h; ++y, srow1+=w) {

        srow0 = ((y > 0 ? y-1 : 1)*w)|0;
        srow2 = ((y < h-1 ? y+1 : h-2)*w)|0;
        drow = (y*dstep)|0;

        // do vertical convolution
        for (x = 0, x1 = 1; x <= w-2; x+=2, x1+=2) {

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

        for (; x < w; ++x, ++x1) {

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
        for (x = 0; x <= w-4; x+=4) {

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

        for (; x < w; ++x) {

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

      if (dst_sum && dst_sqsum) {
        // fill first row with zeros
        for(; i < w1; ++i) {

          dst_sum[i] = 0;
          dst_sqsum[i] = 0;

        }

        p = (w1+1)|0;
        pup = 1;

        for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          s = s2 = 0;

          for (j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

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

          for (; j < w0; ++j, ++k, ++p, ++pup) {

            v = src_d[k];
            s += v;
            s2 += v*v;
            dst_sum[p] = dst_sum[pup] + s;
            dst_sqsum[p] = dst_sqsum[pup] + s2;

          }

        }

      } else if (dst_sum) {

        // fill first row with zeros
        for (; i < w1; ++i) {

          dst_sum[i] = 0;

        }

        p = (w1+1)|0;
        pup = 1;

        for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

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

      } else if (dst_sqsum) {

        // fill first row with zeros
        for (; i < w1; ++i) {

          dst_sqsum[i] = 0;

        }

        p = (w1+1)|0;
        pup = 1;

        for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          s2 = 0;

          for (j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

            v = src_d[k];
            s2 += v*v;
            dst_sqsum[p] = dst_sqsum[pup] + s2;
            v = src_d[k+1];
            s2 += v*v;
            dst_sqsum[p+1] = dst_sqsum[pup+1] + s2;

          }

          for (; j < w0; ++j, ++k, ++p, ++pup) {

            v = src_d[k];
            s2 += v*v;
            dst_sqsum[p] = dst_sqsum[pup] + s2;

          }

        }

      }

      if(dst_tilted) {

        // fill first row with zeros
        for (i = 0; i < w1; ++i) {

          dst_tilted[i] = 0;

        }

        // diagonal
        p = (w1+1)|0;
        pup = 0;

        for (i = 0, k = 0; i < h0; ++i, ++p, ++pup) {

          for (j = 0; j <= w0-2; j+=2, k+=2, p+=2, pup+=2) {

            dst_tilted[p] = src_d[k] + dst_tilted[pup];
            dst_tilted[p+1] = src_d[k+1] + dst_tilted[pup+1];

          }

          for (; j < w0; ++j, ++k, ++p, ++pup) {

            dst_tilted[p] = src_d[k] + dst_tilted[pup];

          }

        }

        // diagonal
        p = (w1+w0)|0;
        pup = w0;

        for (i = 0; i < h0; ++i, p+=w1, pup+=w1) {

          dst_tilted[p] += dst_tilted[pup];

        }

        for (j = w0-1; j > 0; --j) {

          p = j+h0*w1;
          pup=p-w1;

          for (i = h0; i > 0; --i, p-=w1, pup-=w1) {

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

      if (low_thresh > high_thresh) {

        i = low_thresh;
        low_thresh = high_thresh;
        high_thresh = i;

      }

      i = (3 * (w + 2))|0;

      while (--i>=0) {

        buf[i] = 0;

      }

      i = ((h+2) * (w + 2))|0;

      while (--i>=0) {

        map[i] = 0;

      }

      for (; j < w; ++j, grad+=2) {

        //buf[row1+j] = Math.abs(dxdy[grad]) + Math.abs(dxdy[grad+1]);
        x = dxdy[grad];
        y = dxdy[grad+1];
        //buf[row1+j] = x*x + y*y;
        buf[row1+j] = ((x ^ (x >> 31)) - (x >> 31)) + ((y ^ (y >> 31)) - (y >> 31));

      }

      for (i=1; i <= h; ++i, grad+=w2) {

        if (i === h) {

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

        for (j = 0; j < w; ++j, _grad+=2) {

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

      for (i = 0; i < map_w; ++i, ++j) {

        map[j] = 0;

      }
      // path following
      while (stack_i > 0) {

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

      for (i = 0; i < h; ++i, map_i+=map_w) {

        for (j = 0; j < w; ++j) {

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

      for ( dptr = 0; y < dst_height; ++y ) {

        xs0 = m01 * y + m02;
        ys0 = m11 * y + m12;
        ws  = m21 * y + m22;

        for (x = 0; x < dst_width; ++x, ++dptr, xs0+=m00, ys0+=m10, ws+=m20) {

          sc = 1.0 / ws;
          xs = xs0 * sc;
          ys = ys0 * sc;
          ixs = xs | 0;
          iys = ys | 0;

          if (xs > 0 && ys > 0 && ixs < (src_width - 1) && iys < (src_height - 1)) {

            a = _max(xs - ixs, 0.0);
            b = _max(ys - iys, 0.0);
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

      for ( dptr = 0; y < dst_height; ++y ) {

        xs = m01 * y + m02;
        ys = m11 * y + m12;

        for (x = 0; x < dst_width; ++x, ++dptr, xs+=m00, ys+=m10) {

          ixs = xs | 0; iys = ys | 0;

          if (ixs >= 0 && iys >= 0 && ixs < (src_width - 1) && iys < (src_height - 1)) {

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

      while (i--){

        j = i*4;
        r = src.data[j];
        g = src.data[j+1];
        b = src.data[j+2];

        if ( (r>95)&&(g>40)&&(b>20) &&
            (r>g)&&(r>b) &&
            (r-_min(g,b)>15) &&
            (_abs(r-g)>15) ) {

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
// * date 15/09/10 - 14:52
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
  
  var FastCorner = ( function () {

    var Cache = global.Cache;

    var _min = global._min;
    var _max = global._max;

    // ------------------------------------------------------------------
    // private
    // ------------------------------------------------------------------

    /**
     * @for FastCorner
     * @property offsets16
     * @static
     * @private
     * @type {Int32Array}
     * @default new Int32Array([0, 3, 1, 3, 2, 2, 3, 1, 3, 0, 3, -1, 2, -2, 1, -3, 0, -3, -1, -3, -2, -2, -3, -1, -3, 0, -3, 1, -2, 2, -1, 3])
     */
    var offsets16 = new Int32Array([0, 3, 1, 3, 2, 2, 3, 1, 3, 0, 3, -1, 2, -2, 1, -3, 0, -3, -1, -3, -2, -2, -3, -1, -3, 0, -3, 1, -2, 2, -1, 3]);
    /**
     * @for FastCorner
     * @property threshold_tab
     * @static
     * @private
     * @type {Uint8Array}
     * @default new Uint8Array(512);
     */
    var threshold_tab = new Uint8Array(512);
    /**
     * @for FastCorner
     * @property pixel_off
     * @static
     * @private
     * @type {Int32Array}
     * @default new Int32Array(25);
     */
    var pixel_off = new Int32Array(25);
    /**
     * @for FastCorner
     * @property score_diff
     * @static
     * @private
     *
     * @type {Int32Array}
     * @default new Int32Array(25);
     */
    var score_diff = new Int32Array(25);
    /**
     * @for FastCorner
     * @property _threshold
     * @static
     * @default 25
     * @type {number}
     * @private
     */
    var _threshold = 20;

    /**
     * @method _cmp_offsets
     * @static
     * @param {Int32Array} pixel
     * @param {number} step
     * @param {number} pattern_size
     * @private
     */
    function _cmp_offsets ( pixel, step, pattern_size ) {

      var k = 0;
      var offsets = offsets16;

      for ( ; k < pattern_size; ++k ) {

        pixel[k] = offsets[k<<1] + offsets[(k<<1)+1] * step;

      }

      for ( ; k < 25; ++k ) {

        pixel[k] = pixel[k - pattern_size];

      }

    }

    /**
     * @method _cmp_score_16
     * @static
     * @param {Matrix_t} src
     * @param {number} off
     * @param {Int32Array} pixel
     * @param {Matrix_t} d
     * @param {number} threshold
     * @return {number}
     * @private
     */
    function _cmp_score_16 ( src, off, pixel, d, threshold ) {

      var N = 25, k = 0, v = src[off];
      var a0 = threshold,a=0,b0=0,b=0;

      for ( ; k < N; ++k ) {

        d[k] = v - src[off+pixel[k]];

      }

      for ( k = 0; k < 16; k += 2 ) {

        a = _min(d[k+1], d[k+2]);
        a = _min(a, d[k+3]);

        if ( a <= a0 ) {

          continue;

        }

        a = _min(a, d[k+4]);
        a = _min(a, d[k+5]);
        a = _min(a, d[k+6]);
        a = _min(a, d[k+7]);
        a = _min(a, d[k+8]);
        a0 = _max(a0, _min(a, d[k]));
        a0 = _max(a0, _min(a, d[k+9]));

      }

      b0 = -a0;
      for ( k = 0; k < 16; k += 2 ) {

        b = _max(d[k+1], d[k+2]);
        b = _max(b, d[k+3]);
        b = _max(b, d[k+4]);
        b = _max(b, d[k+5]);

        if( b >= b0 ) {

          continue;

        }

        b = _max(b, d[k+6]);
        b = _max(b, d[k+7]);
        b = _max(b, d[k+8]);
        b0 = _min(b0, _max(b, d[k]));
        b0 = _min(b0, _max(b, d[k+9]));

      }

      return -b0-1;

    }

    /**
     * This is FAST corner detector, contributed to OpenCV by the author, Edward Rosten.
     *
     * The references are:
     *
     * Machine learning for high-speed corner detection,
     *
     * E. Rosten and T. Drummond, ECCV 2006
     *
     * Faster and better: A machine learning approach to corner detection
     *
     * E. Rosten, R. Porter and T. Drummond, PAMI, 2009
     *
     * ## Detects corners using the FAST algorithm.
     *
     *      // threshold on difference between intensity of the central pixel
     *      // and pixels of a circle around this pixel
     *      var threshold = 20;
     *      Igata.FastCorners.setThreshold(threshold);
     *
     *      var corners = [], border = 3;
     *
     *      // you should use preallocated keypoint_t array
     *      for(var i = 0; i < img.cols*img.rows, ++i) {
     *
     *        corners[i] = new Igata.Keypoint_t(0,0,0,0);
     *
     *      }
     *
     *      // perform detection
     *      // returns the amount of detected corners
     *      var count = Igata.FastCorners.detect(img:Matrix_t, corners:Array, border = 3);
     *
     *
     * @class FastCorner
     * @static
     * @constructor
     */
    function FastCorner () {
      throw new Error( 'FastCorner can\'t create instance.' );
    }

    var p = FastCorner.prototype;
    p.constructor = FastCorner;

    /**
     * @method setThreshold
     * @static
     * @param {number} threshold
     * @return {number}
     */
    FastCorner.setThreshold = function ( threshold ) {

      _threshold = _min(_max(threshold, 0), 255);

      for (var i = -255; i <= 255; ++i) {

        threshold_tab[(i + 255)] = (i < -_threshold ? 1 : (i > _threshold ? 2 : 0));

      }

      return _threshold;

    };
    /**
     * @deprecated instead use FastCorner.setThreshold
     * @method set_threshold
     * @static
     * @param threshold
     */
    FastCorner.set_threshold = function ( threshold ) {

      return FastCorner.setThreshold( threshold );

    };

    /**
     * @method detect
     * @static
     * @param {Matrix_t} src
     * @param {Matrix_t} corners
     * @param {number=3} [border]
     * @return {number}
     */
    FastCorner.detect = function( src, corners, border ) {

      if (typeof border === "undefined") { border = 3; }

      var K = 8, N = 25;
      var img = src.data, w = src.cols, h = src.rows;
      var i=0, j=0, k=0, vt=0, x=0, m3=0;
      var buf_node = Cache.getBuffer(3 * w);
      var cpbuf_node = Cache.getBuffer(((w+1)*3)<<2);
      var buf = buf_node.u8;
      var cpbuf = cpbuf_node.i32;
      var pixel = pixel_off;
      var sd = score_diff;
      var sy = _max(3, border);
      var ey = _min((h-2), (h-border));
      var sx = _max(3, border);
      var ex = _min((w - 3), (w - border));
      var _count = 0, corners_cnt = 0, pt;
      var score_func = _cmp_score_16;
      var thresh_tab = threshold_tab;
      var threshold = _threshold;

      var v=0,tab=0,d=0,ncorners=0,cornerpos=0,curr=0,ptr=0,prev=0,pprev=0;
      var jp1=0,jm1=0,score=0;

      _cmp_offsets(pixel, w, 16);

      // local vars are faster?
      var pixel0 = pixel[0];
      var pixel1 = pixel[1];
      var pixel2 = pixel[2];
      var pixel3 = pixel[3];
      var pixel4 = pixel[4];
      var pixel5 = pixel[5];
      var pixel6 = pixel[6];
      var pixel7 = pixel[7];
      var pixel8 = pixel[8];
      var pixel9 = pixel[9];
      var pixel10 = pixel[10];
      var pixel11 = pixel[11];
      var pixel12 = pixel[12];
      var pixel13 = pixel[13];
      var pixel14 = pixel[14];
      var pixel15 = pixel[15];

      var w3 = w*3;
      for (i = 0; i < w3; ++i) {

        buf[i] = 0;

      }

      for(i = sy; i < ey; ++i) {

        ptr = ((i * w) + sx)|0;
        m3 = (i - 3)%3;
        curr = (m3*w)|0;
        cornerpos = (m3*(w+1))|0;

        for (j = 0; j < w; ++j) {

          buf[curr+j] = 0;

        }

        ncorners = 0;

        if ( i < (ey - 1) ) {

          j = sx;

          for ( ; j < ex; ++j, ++ptr ) {

            v = img[ptr];
            tab = ( - v + 255 );
            d = ( thresh_tab[tab+img[ptr+pixel0]] | thresh_tab[tab+img[ptr+pixel8]] );

            if( d === 0 ) {

              continue;

            }

            d &= ( thresh_tab[tab+img[ptr+pixel2]] | thresh_tab[tab+img[ptr+pixel10]] );
            d &= ( thresh_tab[tab+img[ptr+pixel4]] | thresh_tab[tab+img[ptr+pixel12]] );
            d &= ( thresh_tab[tab+img[ptr+pixel6]] | thresh_tab[tab+img[ptr+pixel14]] );

            if ( d === 0 ) {

              continue;

            }

            d &= ( thresh_tab[tab+img[ptr+pixel1]] | thresh_tab[tab+img[ptr+pixel9]] );
            d &= ( thresh_tab[tab+img[ptr+pixel3]] | thresh_tab[tab+img[ptr+pixel11]] );
            d &= ( thresh_tab[tab+img[ptr+pixel5]] | thresh_tab[tab+img[ptr+pixel13]] );
            d &= ( thresh_tab[tab+img[ptr+pixel7]] | thresh_tab[tab+img[ptr+pixel15]] );

            if ( d & 1 ) {

              vt = (v - threshold);
              _count = 0;

              for ( k = 0; k < N; ++k ) {

                x = img[(ptr+pixel[k])];

                if (x < vt) {

                  ++_count;

                  if ( _count > K ) {

                    ++ncorners;
                    cpbuf[cornerpos+ncorners] = j;
                    buf[curr+j] = score_func(img, ptr, pixel, sd, threshold);
                    break;

                  }

                } else {

                  _count = 0;

                }

              }// for

            }// if

            if ( d & 2 ) {

              vt = (v + threshold);
              _count = 0;

              for ( k = 0; k < N; ++k ) {

                x = img[(ptr+pixel[k])];

                if (x > vt) {

                  ++_count;

                  if ( _count > K ) {

                    ++ncorners;
                    cpbuf[cornerpos+ncorners] = j;
                    buf[curr+j] = score_func(img, ptr, pixel, sd, threshold);
                    break;

                  }

                } else {

                  _count = 0;

                }

              }

            }

          }

        }

        cpbuf[cornerpos+w] = ncorners;

        if ( i === sy ) {

          continue;

        }

        m3 = (i - 4 + 3)%3;
        prev = (m3*w)|0;
        cornerpos = (m3*(w+1))|0;
        m3 = (i - 5 + 3)%3;
        pprev = (m3*w)|0;

        ncorners = cpbuf[cornerpos+w];

        for ( k = 0; k < ncorners; ++k ) {

          j = cpbuf[cornerpos+k];
          jp1 = (j+1)|0;
          jm1 = (j-1)|0;
          score = buf[prev+j];

          if ( (score > buf[prev+jp1] && score > buf[prev+jm1] &&
            score > buf[pprev+jm1] && score > buf[pprev+j] && score > buf[pprev+jp1] &&
            score > buf[curr+jm1] && score > buf[curr+j] && score > buf[curr+jp1]) ) {

            // save corner
            pt = corners[corners_cnt];
            pt.x = j;
            pt.y = (i-1);
            pt.score = score;
            corners_cnt++;

          }

        }

      } // y loop

      Cache.putBuffer(buf_node);
      Cache.putBuffer(cpbuf_node);
      return corners_cnt;

    };

    return FastCorner;

  }() );

  // set default
  FastCorner.setThreshold( 20 );

  global.FastCorner = FastCorner;

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/10 - 12:18
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
 * Copyright 2007 Computer Vision Lab,
 *
 * Ecole Polytechnique Federale de Lausanne (EPFL), Switzerland.
 *
 * author Vincent Lepetit (http://cvlab.epfl.ch/~lepetit)
 *
 * http://cvlabwww.epfl.ch/~lepetit/
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  global.Yape06 = ( function () {

    var _sqrt = global._sqrt;
    var _min = global._min;
    var _max = global._max;
    var _abs = global._abs;

    // ------------------------------------------------------------------
    // private
    // ------------------------------------------------------------------
    /**
     * @for Yape06
     * @method compute_laplacian
     * @static
     * @private
     *
     * @param src
     * @param dst
     * @param w
     * @param h
     * @param Dxx
     * @param Dyy
     * @param sx
     * @param sy
     * @param ex
     * @param ey
     */
    function compute_laplacian ( src, dst, w, h, Dxx, Dyy, sx,sy, ex,ey ) {

      var y=0,x=0,yrow=(sy*w+sx)|0,row=yrow;

      for(y = sy; y < ey; ++y, yrow+=w, row = yrow) {

        for(x = sx; x < ex; ++x, ++row) {

          dst[row] = -4 * src[row] + src[row+Dxx] + src[row-Dxx] + src[row+Dyy] + src[row-Dyy];

        }

      }

    }

    /**
     * @method hessian_min_eigen_value
     * @static
     * @private
     *
     * @param src
     * @param off
     * @param tr
     * @param Dxx
     * @param Dyy
     * @param Dxy
     * @param Dyx
     * @return {number}
     */
    function hessian_min_eigen_value ( src, off, tr, Dxx, Dyy, Dxy, Dyx ) {

      var Ixx = -2 * src[off] + src[off + Dxx] + src[off - Dxx];
      var Iyy = -2 * src[off] + src[off + Dyy] + src[off - Dyy];
      var Ixy = src[off + Dxy] + src[off - Dxy] - src[off + Dyx] - src[off - Dyx];
      var sqrt_delta = ( _sqrt(((Ixx - Iyy) * (Ixx - Iyy) + 4 * Ixy * Ixy) ) )|0;

      return _min( _abs(tr - sqrt_delta), _abs(-(tr + sqrt_delta)) );

    }

    var Cache = global.Cache;

    /**
     * Laplacian and min eigen value based feature detector by CVLab (Ecole Polytechnique Federale de Lausanne (EPFL), Switzerland).
     *
     *
     *      var corners = [],
     *      laplacian_threshold = 30,
     *      min_eigen_value_threshold = 25;
     *
     *      // choose threshold values
     *      Igata.Yape06.hreshold = laplacian_threshold;
     *      Igata.Yape06.thresholdMin = min_eigen_value_threshold;
     *
     *      // you should use preallocated keypoint_t array
     *      for(var i = 0; i < img.cols*img.rows, ++i) {
     *
     *        corners[i] = new Igata.Keypoint_t(0,0,0,0);
     *
     *      }
     *
     *      // perform detection
     *      // returns the amount of detected corners
     *      var count = Igata.Yape06.detect(img:Matrix_t, corners:Array, border = 5);
     *
     *
     * @class Yape06
     * @static
     * @constructor
     */
    function Yape06 () {
      throw new Error( 'Yape06 can\'t create instance.' );
    }

    var p = Yape06.prototype;
    p.constructor = Yape06;

    /**
     * @property threshold
     * @static
     * @type {number}
     * @default 30
     */
    Yape06.threshold = 30;
    /**
     * @deprecated instead use Yape06.threshold
     * @property laplacian_threshold
     * @type {number}
     */
    Yape06.laplacian_threshold = Yape06.threshold;

    /**
     * @property thresholdMin
     * @static
     * @type {number}
     * @default 25
     */
    Yape06.thresholdMin = 25;
    /**
     * @deprecated instead use Yape06.thresholdMin
     * @property min_eigen_value_threshold
     * @type {number}
     */
    Yape06.min_eigen_value_threshold = Yape06.thresholdMin;

    /**
     * @method detect
     * @static
     *
     * @param {Matrix_t} src
     * @param {*} [points]
     * @param {number=5} [border]
     * @return {number}
     */
    Yape06.detect = function ( src, points, border ) {

      if (typeof border === "undefined") { border = 5; }

      var x=0,y=0;
      var w=src.cols, h=src.rows, srd_d=src.data;
      var Dxx = 5, Dyy = (5 * w)|0;
      var Dxy = (3 + 3 * w)|0, Dyx = (3 - 3 * w)|0;
      var lap_buf = Cache.getBuffer((w*h)<<2);
      var laplacian = lap_buf.i32;
      var lv=0, row=0,rowx=0,min_eigen_value=0,pt;
      var number_of_points = 0;
      var lap_thresh = Yape06.threshold;
      var eigen_thresh = Yape06.thresholdMin;

      var sx = _max(5, border)|0;
      var sy = _max(3, border)|0;
      var ex = _min(w-5, w-border)|0;
      var ey = _min(h-3, h-border)|0;

      x = w*h;
      while(--x>=0) {

        laplacian[x]=0;

      }

      compute_laplacian(srd_d, laplacian, w, h, Dxx, Dyy, sx,sy, ex,ey);

      row = (sy*w+sx)|0;
      for (y = sy; y < ey; ++y, row += w) {

        for (x = sx, rowx=row; x < ex; ++x, ++rowx) {

          lv = laplacian[rowx];

          if (
              ( lv < -lap_thresh &&
                lv < laplacian[rowx - 1]     && lv < laplacian[rowx + 1] &&
                lv < laplacian[rowx - w]     && lv < laplacian[rowx + w] &&
                lv < laplacian[rowx - w - 1] && lv < laplacian[rowx + w - 1] &&
                lv < laplacian[rowx - w + 1] && lv < laplacian[rowx + w + 1]) ||

              ( lv > lap_thresh &&
                lv > laplacian[rowx - 1]     && lv > laplacian[rowx + 1] &&
                lv > laplacian[rowx - w]     && lv > laplacian[rowx + w] &&
                lv > laplacian[rowx - w - 1] && lv > laplacian[rowx + w - 1] &&
                lv > laplacian[rowx - w + 1] && lv > laplacian[rowx + w + 1])
          ) {

            min_eigen_value = hessian_min_eigen_value(srd_d, rowx, lv, Dxx, Dyy, Dxy, Dyx);

            if (min_eigen_value > eigen_thresh) {

              pt = points[number_of_points];
              pt.x = x;
              pt.y = y;
              pt.score = min_eigen_value;
              ++number_of_points;
              ++x;
              ++rowx; // skip next pixel since this is maxima in 3x3

            }// if

          }// if

        }// for

      }// for

      Cache.putBuffer(lap_buf);

      return number_of_points;

    };

    return Yape06;

  }() );


}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/10 - 15:48
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

  global.Yape = ( function () {

    var _sqrt = global._sqrt;
    var _min = global._min;
    var _max = global._max;
    var _abs = global._abs;

    // ------------------------------------------------------------------
    // private
    // ------------------------------------------------------------------

    /**
     * @for Yape
     * @method precompute_directions
     * @static
     * @private
     *
     * @param {number} step
     * @param {Matrix_t} dirs
     * @param {number} R
     * @return {number}
     */
    function precompute_directions (step, dirs, R) {
      var i = 0;
      var x, y;

      x = R;
      for ( y = 0; y < x; y = (y+1)|0, i = (i+1)|0 ) {
        
        x = (_sqrt((R * R - y * y)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( x-- ; x < y && x >= 0; x--, i = (i+1)|0 ) {
        
        y = (_sqrt((R * R - x * x)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for (  ; -x < y; x--, i = (i+1)|0 ) {
        
        y = (_sqrt((R * R - x * x)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( y-- ; y >= 0; y--, i++) {
        
        x = (-_sqrt((R * R - y * y)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( ; y > x; y--, i = (i+1)|0 ) {
        
        x = (-_sqrt((R * R - y * y)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( x++ ; x <= 0; x = (x+1)|0, i = (i+1)|0 ) {
        
        y = (-_sqrt((R * R - x * x)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( ; x < -y; x = (x+1)|0, i = (i+1)|0 ) {
        
        y = (-_sqrt((R * R - x * x)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( y++ ; y < 0; y = (y+1)|0, i = (i+1)|0 ) {
        
        x = (_sqrt((R * R - y * y)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }

      dirs[i] = dirs[0];
      dirs[i + 1] = dirs[1];
      
      return i;
      
    }

    /**
     * @for Yape
     * @method third_check
     * @static
     * @private
     *
     * @param {Matrix_t} Sb
     * @param {number} off
     * @param {number} step
     * @return {number}
     */
    function third_check (Sb, off, step) {

      var n = 0;
      if (Sb[off+1]      !== 0) { n++; }
      if (Sb[off-1]      !== 0) { n++; }
      if (Sb[off+step]   !== 0) { n++; }
      if (Sb[off+step+1] !== 0) { n++; }
      if (Sb[off+step-1] !== 0) { n++; }
      if (Sb[off-step]   !== 0) { n++; }
      if (Sb[off-step+1] !== 0) { n++; }
      if (Sb[off-step-1] !== 0) { n++; }

      return n;

    }

    /**
     * @for Yape
     * @method is_local_maxima
     * @static
     * @private
     *
     * @param {Matrix_t} p
     * @param {number} off
     * @param {number} v
     * @param {number} step
     * @param {number} neighborhood
     * @return {boolean}
     */
    function is_local_maxima (p, off, v, step, neighborhood) {

      var x, y;

      if (v > 0) {

        off -= step*neighborhood;

        for (y= -neighborhood; y<=neighborhood; ++y) {

          for (x= -neighborhood; x<=neighborhood; ++x) {

            if (p[off+x] > v) { return false; }

          }

          off += step;

        }

      } else {

        off -= step*neighborhood;

        for (y= -neighborhood; y<=neighborhood; ++y) {

          for (x= -neighborhood; x<=neighborhood; ++x) {

            if (p[off+x] < v) { return false; }

          }

          off += step;

        }

      }

      return true;

    }

    /**
     * @for perform_one_point
     * @method perform_one_point
     * @static
     * @private
     *
     * @param I
     * @param x
     * @param Scores
     * @param Im
     * @param Ip
     * @param dirs
     * @param opposite
     * @param dirs_nb
     */
    function perform_one_point (I, x, Scores, Im, Ip, dirs, opposite, dirs_nb) {

      var score = 0;
      var a = 0, b = (opposite - 1)|0;
      var A=0, B0=0, B1=0, B2=0;
      var state=0;

      // WE KNOW THAT NOT(A ~ I0 & B1 ~ I0):
      A = I[x+dirs[a]];

      if ((A <= Ip)) {

        if ((A >= Im)) { // A ~ I0

          B0 = I[x+dirs[b]];

          if ((B0 <= Ip)) {

            if ((B0 >= Im)) { Scores[x] = 0; return; }

            else {

              b++; B1 = I[x+dirs[b]];

              if ((B1 > Ip)) {

                b++; B2 = I[x+dirs[b]];
                if ((B2 > Ip)) { state = 3; }
                else if ((B2 < Im)) { state = 6;}
                else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

              }
              else/* if ((B1 < Im))*/ {

                b++; B2 = I[x+dirs[b]];

                if ((B2 > Ip)) { state = 7; }
                else if ((B2 < Im)) { state = 2; }
                else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

              }

              //else { Scores[x] = 0; return; } // A ~ I0, B1 ~ I0

            }

          } else {

            // B0 < I0
            b++; B1 = I[x+dirs[b]];

            if ((B1 > Ip)) {

              b++; B2 = I[x+dirs[b]];

              if ((B2 > Ip)) { state = 3; }
              else if ((B2 < Im)) { state = 6; }
              else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

            } else if ((B1 < Im)) {

              b++; B2 = I[x+dirs[b]];

              if ((B2 > Ip)) { state = 7; }
              else if ((B2 < Im)) { state = 2; }
              else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

            } else { Scores[x] = 0; return; } // A ~ I0, B1 ~ I0

          }

        } else {

          // A > I0
          B0 = I[x+dirs[b]];

          if ((B0 > Ip)) { Scores[x] = 0; return; }

          b++; B1 = I[x+dirs[b]];
          if ((B1 > Ip)) { Scores[x] = 0; return; }

          b++; B2 = I[x+dirs[b]];
          if ((B2 > Ip)) { Scores[x] = 0; return; }
          state = 1;

        }

      }
      else {

        // A < I0
        B0 = I[x+dirs[b]];
        if ((B0 < Im)) { Scores[x] = 0; return; }

        b++; B1 = I[x+dirs[b]];
        if ((B1 < Im)) { Scores[x] = 0; return; }

        b++; B2 = I[x+dirs[b]];
        if ((B2 < Im)) { Scores[x] = 0; return; }

        state = 0;

      }

      for (a = 1; a <= opposite; a++) {

        A = I[x+dirs[a]];

        switch(state) {

          case 0:
            if ((A > Ip)) {

              B1 = B2; b++; B2 = I[x+dirs[b]];
              if ((B2 < Im)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 0; break; }

            }

            if ((A < Im)) {

              if ((B1 > Ip)) { Scores[x] = 0; return; }
              if ((B2 > Ip)) { Scores[x] = 0; return; }
              B1 = B2; b++; B2 = I[x+dirs[b]];
              if ((B2 > Ip)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 8; break; }

            }

            // A ~ I0
            if ((B1 <= Ip)) { Scores[x] = 0; return; }
            if ((B2 <= Ip)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            if ((B2 > Ip)) { score -= A + B1; state = 3; break; }
            if ((B2 < Im)) { score -= A + B1; state = 6; break; }
            else { Scores[x] = 0; return; }

            break;

          case 1:
            if ((A < Im)) {

              B1 = B2; b++; B2 = I[x+dirs[b]];
              if ((B2 > Ip)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 1; break; }

            }

            if ((A > Ip)) {

              if ((B1 < Im)) { Scores[x] = 0; return; }
              if ((B2 < Im)) { Scores[x] = 0; return; }

              B1 = B2; b++; B2 = I[x+dirs[b]];
              if ((B2 < Im)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 9; break; }

            }

            // A ~ I0
            if ((B1 >= Im)) { Scores[x] = 0; return; }
            if ((B2 >= Im)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];
            if ((B2 < Im)) { score -= A + B1; state = 2; break; }
            if ((B2 > Ip)) { score -= A + B1; state = 7; break; }
            else { Scores[x] = 0; return; }

            break;

          case 2:
            if ((A > Ip)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            if ((A < Im)) {

              if ((B2 > Ip)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 4; break; }

            }

            // A ~ I0
            if ((B2 > Ip)) { score -= A + B1; state = 7; break; }
            if ((B2 < Im)) { score -= A + B1; state = 2; break; }
            else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

            break;

          case 3:
            if ((A < Im)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            if ((A > Ip)) {

              if ((B2 < Im)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 5; break; }

            }

            // A ~ I0
            if ((B2 > Ip)) { score -= A + B1; state = 3; break; }
            if ((B2 < Im)) { score -= A + B1; state = 6; break; }
            else { Scores[x] = 0; return; }

            break;

          case 4:
            if ((A > Ip)) { Scores[x] = 0; return; }

            if ((A < Im)) {

              B1 = B2; b++; B2 = I[x+dirs[b]];

              if ((B2 > Ip)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 1; break; }

            }

            if ((B2 >= Im)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            if ((B2 < Im)) { score -= A + B1; state = 2; break; }
            if ((B2 > Ip)) { score -= A + B1; state = 7; break; }
            else { Scores[x] = 0; return; }

            break;

          case 5:
            if ((A < Im)) { Scores[x] = 0; return; }

            if ((A > Ip)) {

              B1 = B2; b++; B2 = I[x+dirs[b]];

              if ((B2 < Im)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 0; break; }

            }

            // A ~ I0
            if ((B2 <= Ip)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            if ((B2 > Ip)) { score -= A + B1; state = 3; break; }
            if ((B2 < Im)) { score -= A + B1; state = 6; break; }
            else { Scores[x] = 0; return; }

            break;

          case 7:
            if ((A > Ip)) { Scores[x] = 0; return; }
            if ((A < Im)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            // A ~ I0
            if ((B2 > Ip)) { score -= A + B1; state = 3; break; }
            if ((B2 < Im)) { score -= A + B1; state = 6; break; }
            else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

            break;

          case 6:
            if ((A > Ip)) { Scores[x] = 0; return; }
            if ((A < Im)) { Scores[x] = 0; return; }

            B1 = B2; b++; B2 = I[x+dirs[b]];

            // A ~ I0
            if ((B2 < Im)) { score -= A + B1; state = 2; break; }
            if ((B2 > Ip)) { score -= A + B1; state = 7; break; }
            else { Scores[x] = 0; return; } // A ~ I0, B2 ~ I0

            break;

          case 8:
            if ((A > Ip)) {

              if ((B2 < Im)) { Scores[x] = 0; return; }

              B1 = B2; b++; B2 = I[x+dirs[b]];

              if ((B2 < Im)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 9; break; }

            }

            if ((A < Im)) {

              B1 = B2; b++; B2 = I[x+dirs[b]];

              if ((B2 > Ip)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 1; break; }

            }
            else { Scores[x] = 0; return; }

            break;

          case 9:
            if ((A < Im)) {

              if ((B2 > Ip)) { Scores[x] = 0; return; }

              B1 = B2; b++; B2 = I[x+dirs[b]];

              if ((B2 > Ip)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 8; break; }

            }

            if ((A > Ip)) {

              B1 = B2; b++; B2 = I[x+dirs[b]];

              if ((B2 < Im)) { Scores[x] = 0; return; }
              else { score -= A + B1; state = 0; break; }

            }
            else { Scores[x] = 0; return; }

            break;

          default:
            //"PB default";
            break;
        } // switch(state)
      } // for(a...)

      Scores[x] = (score + dirs_nb * I[x]);

    }

    var Table_t = ( function () {

      /**
       * Yape inner Class
       * @class Table_t
       * @param w
       * @param h
       * @param r
       * @constructor
       */
      function Table_t ( w, h, r ) {

        var dirs = new Int32Array(1024);
        /**
         * @property dirs
         * @type {Int32Array}
         */
        this.dirs = dirs;
        /**
         * @property dirs_count
         * @type {number}
         */
        this.dirs_count = precompute_directions(w, dirs, r)|0;
        /**
         * @property scores
         * @type {Int32Array}
         */
        this.scores = new Int32Array(w*h);
        /**
         * @property radius
         * @type {number}
         */
        this.radius = r|0;

      }

      var p = Table_t.prototype;
      p.constructor = Table_t;

      return Table_t;

    }() );

    /**
     * @deprecated instead use Table_t
     * @class lev_table_t
     */
    var lev_table_t = Table_t;

    /**
     * Yet Another Point Extractor by CVLab (Ecole Polytechnique Federale de Lausanne (EPFL), Switzerland).
     *
     *
     *      var corners = [],
     *      image_width = img.cols, image_height = img.rows,
     *      radius = 5, pyramid_levels = 1; // for now only single level support
     *
     *      // YAPE needs init before running detection
     *      Igata.Yape.init(image_width, image_height, radius, pyramid_levels);
     *
     *      // you should use preallocated keypoint_t array
     *      for(var i = 0; i < img.cols*img.rows, ++i) {
     *
     *        corners[i] = new Igata.Keypoint_t(0,0,0,0);
     *
     *      }
     *
     *      // perform detection
     *      // returns the amount of detected corners
     *      var count = Igata.Yape.detect(img:matrix_t, corners:Array, border = 4);
     *
     *
     * @class Yape
     * @static
     * @constructor
     */
    function Yape () {
      throw new Error( 'Yape can\'t create instance.' );
    }

    var p = Yape.prototype;
    p.constructor = Yape;

    /**
     * @property level_tables
     * @static
     * @type {Array}
     */
    Yape.level_tables = [];

    /**
     * @property tau
     * @static
     * @type {number}
     * @default 7
     */
    Yape.tau = 7;

    /**
     * @method init
     * @static
     * @param {number} width
     * @param {number} height
     * @param {number} radius
     * @param {number=1} [pyramid_levels]
     */
    Yape.init = function ( width, height, radius, pyramid_levels ) {

      if (typeof pyramid_levels === "undefined") { pyramid_levels = 1; }

      var i;
      radius = _min(radius, 7);
      radius = _max(radius, 3);

      for(i = 0; i < pyramid_levels; ++i) {

        this.level_tables[i] = new Table_t(width>>i, height>>i, radius);

      }

    };
    /**
     * @method detect
     * @static
     * @param {Matrix_t} src
     * @param {*} [points]
     * @param {number=4} [border]
     * @return {number}
     */
    Yape.detect = function ( src, points, border ) {

      if (typeof border === "undefined") { border = 4; }

      var t = Yape.level_tables[0];
      var R = t.radius|0, Rm1 = (R-1)|0;
      var dirs = t.dirs;
      var dirs_count = t.dirs_count|0;
      var opposite = dirs_count >> 1;
      var img = src.data, w=src.cols|0, h=src.rows|0,hw=w>>1;
      var scores = t.scores;
      var x=0,y=0,row=0,rowx=0,ip=0,im=0,abs_score=0, score=0;
      var tau = Yape.tau|0;
      var number_of_points = 0, pt;

      var sx = _max(R+1, border)|0;
      var sy = _max(R+1, border)|0;
      var ex = _min(w-R-2, w-border)|0;
      var ey = _min(h-R-2, h-border)|0;

      row = (sy*w+sx)|0;

      for (y = sy; y < ey; ++y, row+=w) {

        for (x = sx, rowx = row; x < ex; ++x, ++rowx) {

          ip = img[rowx] + tau;
          im = img[rowx] - tau;

          if ( im<img[rowx+R] && img[rowx+R]<ip && im<img[rowx-R] && img[rowx-R]<ip ) {

            scores[rowx] = 0;

          } else {

            perform_one_point(img, rowx, scores, im, ip, dirs, opposite, dirs_count);

          }

        }

      }

      // local maxima
      row = (sy*w+sx)|0;

      for (y = sy; y < ey; ++y, row+=w) {

        for (x = sx, rowx = row; x < ex; ++x, ++rowx) {

          score = scores[rowx];

          abs_score = Math.abs(score);

          if (abs_score < 5) {

            // if this pixel is 0, the next one will not be good enough. Skip it.
            ++x;
            ++rowx;

          } else {

            if (third_check(scores, rowx, w) >= 3 && is_local_maxima(scores, rowx, score, hw, R)) {

              pt = points[number_of_points];
              pt.x = x;
              pt.y = y;
              pt.score = abs_score;

              ++number_of_points;

              x += Rm1;
              rowx += Rm1;

            }

          }

        }

      }

      return number_of_points;

    };

    return Yape;

  }() );

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

  global.Orb = ( function () {

    var U8_t = global.U8_t;
    //var Calc = global.Calc;
    var Matrix_t = global.Matrix_t;
    var Processing = global.Processing;

    var _cos = global._cos;
    var _sin = global._sin;
    /**
     * @for Orb
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
     * @for Orb
     * @property H
     * @static
     * @private
     *
     * @type {Matrix_t|*}
     */
    var H = new Matrix_t(3, 3, Igata.F32_t|Igata.C1_t);
    /**
     * @for Orb
     * @property patch_img
     * @static
     * @private
     *
     * @type {Matrix_t|*}
     */
    var patch_img = new Matrix_t(32, 32, U8_t|Igata.C1_t);

    /**
     * @for Orb
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

      var cosine = _cos(angle);
      var sine   = _sin(angle);

      H.data[0] = cosine;
      H.data[1] = -sine;
      H.data[2] = (-cosine + sine  ) * psize*0.5 + px;
      H.data[3] = sine;
      H.data[4] =  cosine;
      H.data[5] = (-sine   - cosine) * psize*0.5 + py;

      Processing.affine(src, dst, H, 128);

    }

    /**
     * Oriented and Rotated BRIEF. [for more info see: http://en.wikipedia.org/wiki/ORB_(feature_descriptor)]
     *
     *
     *      var corners = []; // Igata.Keypoint_t Array
     *
     *      vvar cols = 32; // 32 Bytes / 256 BIT descriptor
     *      vvar rows = num_corners; // descriptors stored per row
     *      vvar descriptors = new Igata.Matrix_t(cols, rows, Igata.U8_t | Igata.C1_t);
     *
     *      Igata.Orb.describe(img_u8:Matrix_t, corners:Array, num_corners, descriptors:Matrix_t);
     *
     *
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
     * @param {Array|Keypoint_t} corners
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

      if ( !(descriptors.type&U8_t) ) {

        // relocate to U8 type
        descriptors.type = U8_t;
        descriptors.cols = DESCR_SIZE;
        descriptors.rows = count;
        descriptors.channel = 1;
        descriptors.allocate();

      } else {

        descriptors.resize( DESCR_SIZE, count, 1 );

      }

      var descr_d = descriptors.data;
      var descr_off = 0;

      for (i = 0; i < count; ++i) {

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
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/10 - 16:52
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


  global.Kanade = ( function () {
    
    var Cache = global.Cache;
    var Matrix_t = global.Matrix_t;

    var scharr_deriv = global.Processing.scharrDerivatives;

    /**
     * Calculates an optical flow for a sparse feature set using the iterative Lucas-Kanade method with pyramids.
     *
     * @class Kanade
     * @static
     * @constructor
     */
    function Kanade () {
      throw new Error( 'Kanade can\'t create instance.' );
    }

    var p = Kanade.prototype;
    p.constructor = Kanade;

    /**
     * @method track
     * @static
     *
     * @param {Pyramid_t} prev_pyr previous frame 8-bit pyramid_t
     * @param {Pyramid_t} curr_pyr current frame 8-bit pyramid_t
     * @param {Array} prev_xy Array of 2D coordinates for which the flow needs to be found
     * @param {Array} curr_xy Array of 2D coordinates containing the calculated new positions
     * @param {number} count number of input coordinates
     * @param {number} win_size size of the search window at each pyramid level
     * @param {number=30} [max_iter] stop searching after the specified maximum number of iterations
     * @param {Uint8Array} [status] each element is set to 1 if the flow for the corresponding features has been found overwise 0
     * @param {number=0.01} [eps] stop searching when the search window moves by less than eps
     * @param {number=0.0001} [min_eigen_threshold] the algorithm calculates the minimum eigen value of a 2x2 normal matrix of optical flow equations, divided by number of pixels in a window; if this value is less than min_eigen_threshold, then a corresponding feature is filtered out and its flow is not processed, it allows to remove bad points and get a performance boost
     */
    Kanade.track = function ( prev_pyr, curr_pyr, prev_xy, curr_xy, count, win_size, max_iter, status, eps, min_eigen_threshold ) {

      if (typeof max_iter === "undefined") { max_iter = 30; }
      if (typeof status === "undefined") { status = new Uint8Array(count); }
      if (typeof eps === "undefined") { eps = 0.01; }
      if (typeof min_eigen_threshold === "undefined") { min_eigen_threshold = 0.0001; }

      var half_win = (win_size-1)*0.5;
      var win_area = (win_size*win_size)|0;
      var win_area2 = win_area << 1;
      var prev_imgs = prev_pyr.data, next_imgs = curr_pyr.data;
      var img_prev=prev_imgs[0].data,img_next=next_imgs[0].data;
      var w0 = prev_imgs[0].cols, h0 = prev_imgs[0].rows,lw=0,lh=0;

      var iwin_node = Cache.getBuffer(win_area<<2);
      var deriv_iwin_node = Cache.getBuffer(win_area2<<2);
      var deriv_lev_node = Cache.getBuffer((h0*(w0<<1))<<2);

      var deriv_m = new Matrix_t(w0, h0, Igata.S32C2_t, deriv_lev_node.data);

      var iwin_buf = iwin_node.i32;
      var deriv_iwin = deriv_iwin_node.i32;
      var deriv_lev = deriv_lev_node.i32;

      var dstep=0,src=0,dsrc=0,iptr=0,diptr=0,jptr=0;
      var lev_sc=0.0,prev_x=0.0,prev_y=0.0,next_x=0.0,next_y=0.0;
      var prev_delta_x=0.0,prev_delta_y=0.0,delta_x=0.0,delta_y=0.0;
      var iprev_x=0,iprev_y=0,inext_x=0,inext_y=0;
      var i=0,j=0,x=0,y=0,level=0,ptid=0,iter=0;
      var brd_tl=0,brd_r=0,brd_b=0;
      var a=0.0,b=0.0,b1=0.0,b2=0.0;

      // fixed point math
      var W_BITS14 = 14;
      var W_BITS4 = 14;
      var W_BITS1m5 = W_BITS4 - 5;
      var W_BITS1m51 = (1 << ((W_BITS1m5) - 1));
      var W_BITS14_ = (1 << W_BITS14);
      var W_BITS41 = (1 << ((W_BITS4) - 1));
      var FLT_SCALE = 1.0/(1 << 20);
      var iw00=0,iw01=0,iw10=0,iw11=0,ival=0,ixval=0,iyval=0;
      var A11=0.0,A12=0.0,A22=0.0,D=0.0,min_eig=0.0;

      var FLT_EPSILON = 0.00000011920929;
      eps *= eps;

      // reset status
      for (; i < count; ++i) {
        
        status[i] = 1;
        
      }

      var max_level = (prev_pyr.levels - 1)|0;
      level = max_level;

      for (; level >= 0; --level) {
        
        lev_sc = (1.0/(1 << level));
        lw = w0 >> level;
        lh = h0 >> level;
        dstep = lw << 1;
        img_prev = prev_imgs[level].data;
        img_next = next_imgs[level].data;

        brd_r = (lw - win_size)|0;
        brd_b = (lh - win_size)|0;

        // calculate level derivatives
        scharr_deriv(prev_imgs[level], deriv_m);

        // iterate through points
        for (ptid = 0; ptid < count; ++ptid) {
          
          i = ptid << 1;
          j = i + 1;
          prev_x = prev_xy[i]*lev_sc;
          prev_y = prev_xy[j]*lev_sc;

          if( level === max_level ) {
            
            next_x = prev_x;
            next_y = prev_y;
            
          } else {
            
            next_x = curr_xy[i]*2.0;
            next_y = curr_xy[j]*2.0;
            
          }
          
          curr_xy[i] = next_x;
          curr_xy[j] = next_y;

          prev_x -= half_win;
          prev_y -= half_win;
          iprev_x = prev_x|0;
          iprev_y = prev_y|0;

          // border check
          x = (iprev_x <= brd_tl)|(iprev_x >= brd_r)|(iprev_y <= brd_tl)|(iprev_y >= brd_b);
          
          if ( x !== 0 ) {
            
            if ( level === 0 ) {
              
              status[ptid] = 0;
              
            }
            
            continue;
            
          }

          a = prev_x - iprev_x;
          b = prev_y - iprev_y;
          iw00 = (((1.0 - a)*(1.0 - b)*W_BITS14_) + 0.5)|0;
          iw01 = ((a*(1.0 - b)*W_BITS14_) + 0.5)|0;
          iw10 = (((1.0 - a)*b*W_BITS14_) + 0.5)|0;
          iw11 = (W_BITS14_ - iw00 - iw01 - iw10);

          A11 = 0.0;
          A12 = 0.0;
          A22 = 0.0;

          // extract the patch from the first image, compute covariation matrix of derivatives
          for ( y = 0; y < win_size; ++y ) {
            
            src = ( (y + iprev_y)*lw + iprev_x )|0;
            dsrc = src << 1;

            iptr = (y*win_size)|0;
            diptr = iptr << 1;
            
            for (x = 0 ; x < win_size; ++x, ++src, ++iptr, dsrc += 2) {
              
              ival = ( (img_prev[src])*iw00 + (img_prev[src+1])*iw01 + (img_prev[src+lw])*iw10 + (img_prev[src+lw+1])*iw11 );
              ival = (((ival) + W_BITS1m51) >> (W_BITS1m5));

              ixval = ( deriv_lev[dsrc]*iw00 + deriv_lev[dsrc+2]*iw01 + deriv_lev[dsrc+dstep]*iw10 + deriv_lev[dsrc+dstep+2]*iw11 );
              ixval = (((ixval) + W_BITS41) >> (W_BITS4));

              iyval = ( deriv_lev[dsrc+1]*iw00 + deriv_lev[dsrc+3]*iw01 + deriv_lev[dsrc+dstep+1]*iw10 + deriv_lev[dsrc+dstep+3]*iw11 );
              iyval = (((iyval) + W_BITS41) >> (W_BITS4));

              iwin_buf[iptr] = ival;
              deriv_iwin[diptr++] = ixval;
              deriv_iwin[diptr++] = iyval;

              A11 += ixval*ixval;
              A12 += ixval*iyval;
              A22 += iyval*iyval;
              
            }
            
          }

          A11 *= FLT_SCALE; A12 *= FLT_SCALE; A22 *= FLT_SCALE;

          D = A11*A22 - A12*A12;
          min_eig = (A22 + A11 - Math.sqrt((A11-A22)*(A11-A22) + 4.0*A12*A12)) / win_area2;

          if ( min_eig < min_eigen_threshold || D < FLT_EPSILON ) {
            
            if ( level === 0 ) {
              
              status[ptid] = 0;
              
            }
            
            continue;
            
          }

          D = 1.0/D;

          next_x -= half_win;
          next_y -= half_win;
          prev_delta_x = 0.0;
          prev_delta_y = 0.0;

          for ( iter = 0; iter < max_iter; ++iter ) {
            
            inext_x = next_x|0;
            inext_y = next_y|0;

            x = (inext_x <= brd_tl)|(inext_x >= brd_r)|(inext_y <= brd_tl)|(inext_y >= brd_b);
            
            if ( x !== 0 ) {
              
              if ( level === 0 ) {
                
                status[ptid] = 0;
                
              }
              
              break;
              
            }

            a = next_x - inext_x;
            b = next_y - inext_y;
            iw00 = (((1.0 - a)*(1.0 - b)*W_BITS14_) + 0.5)|0;
            iw01 = ((a*(1.0 - b)*W_BITS14_) + 0.5)|0;
            iw10 = (((1.0 - a)*b*W_BITS14_) + 0.5)|0;
            iw11 = (W_BITS14_ - iw00 - iw01 - iw10);
            b1 = 0.0;
            b2 = 0.0;

            for ( y = 0; y < win_size; ++y ) {
              
              jptr = ( (y + inext_y)*lw + inext_x )|0;

              iptr = (y*win_size)|0;
              diptr = iptr << 1;
              
              for ( x = 0 ; x < win_size; ++x, ++jptr, ++iptr ) {
                
                ival = ( (img_next[jptr])*iw00 + (img_next[jptr+1])*iw01 + (img_next[jptr+lw])*iw10 + (img_next[jptr+lw+1])*iw11 );
                ival = (((ival) + W_BITS1m51) >> (W_BITS1m5));
                ival = (ival - iwin_buf[iptr]);

                b1 += ival * deriv_iwin[diptr++];
                b2 += ival * deriv_iwin[diptr++];
                
              }
              
            }

            b1 *= FLT_SCALE;
            b2 *= FLT_SCALE;

            delta_x = ((A12*b2 - A22*b1) * D);
            delta_y = ((A12*b1 - A11*b2) * D);

            next_x += delta_x;
            next_y += delta_y;
            curr_xy[i] = next_x + half_win;
            curr_xy[j] = next_y + half_win;

            if ( delta_x*delta_x + delta_y*delta_y <= eps ) {
              
              break;
              
            }

            if ( iter > 0 && Math.abs(delta_x + prev_delta_x) < 0.01 && Math.abs(delta_y + prev_delta_y) < 0.01 ) {
              
              curr_xy[i] -= delta_x*0.5;
              curr_xy[j] -= delta_y*0.5;
              break;
              
            }

            prev_delta_x = delta_x;
            prev_delta_y = delta_y;
            
          }
          
        } // points loop
        
      } // levels loop

      Cache.putBuffer(iwin_node);
      Cache.putBuffer(deriv_iwin_node);
      Cache.putBuffer(deriv_lev_node);
      
    };

    return Kanade;

  }() );

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/10 - 17:36
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
/*jslint -W017*/
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

  global.Haar = ( function () {

    // ------------------------------------------------------------------
    // private
    // ------------------------------------------------------------------
    /**
     * @method _group_func
     * @param r1
     * @param r2
     * @return {boolean|number}
     * @private
     */
    function _group_func ( r1, r2 ) {

      var distance = (r1.width * 0.25 + 0.5)|0;

      return r2.x <= r1.x + distance &&
        r2.x >= r1.x - distance &&
        r2.y <= r1.y + distance &&
        r2.y >= r1.y - distance &&
        r2.width <= (r1.width * 1.5 + 0.5)|0 &&
        (r2.width * 1.5 + 0.5)|0 >= r1.width;

    }

    /**
     * @class Haar
     * @static
     * @constructor
     */
    function Haar () {
      throw new Error( 'Haar can\'t create instance.' );
    }

    var p = Haar.prototype;
    p.constructor = Haar;

    /**
     * @property desity
     * @static
     * @type {number}
     * @default 0.07
     */
    Haar.desity = 0.07;
    /**
     * @deprecated instead use Haar.desity
     * @property edges_density
     * @static
     * @type {number}
     */
    Haar.edges_density = Haar.desity;

    /**
     * Evaluates a Haar cascade classifier at a specified scale
     *
     * @method singleScale
     * @static
     *
     * @param {Array} int_sum integral of the source image
     * @param {Array} int_sqsum squared integral of the source image
     * @param {Array} int_tilted tilted integral of the source image
     * @param {Array} int_canny_sum integral of canny source image or undefined
     * @param {number} width width of the source image
     * @param {number} height height of the source image
     * @param {number} scale image scale
     * @param {*} classifier haar cascade classifier
     * @return {Array} rectangles representing detected object
     */
    Haar.singleScale = function ( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, scale, classifier ) {

      var
        win_w = (classifier.size[0] * scale)|0,
        win_h = (classifier.size[1] * scale)|0,
        step_x = (0.5 * scale + 1.5)|0,
        step_y = step_x;

      var i,j,k,x,y,ex=(width-win_w)|0,ey=(height-win_h)|0;
      var w1=(width+1)|0,edge_dens,mean,variance,std;
      var inv_area = 1.0 / (win_w * win_h);
      var stages,stage,trees,tree,sn,tn,fn,found=true,stage_thresh,stage_sum,tree_sum,feature,features;
      var fi_a,fi_b,fi_c,fi_d,fw,fh;

      var ii_a=0,ii_b=win_w,ii_c=win_h*w1,ii_d=ii_c+win_w;
      var edges_thresh = ((win_w*win_h) * 0xff * Haar.desity)|0;
      // if too much gradient we also can skip
      //var edges_thresh_high = ((win_w*win_h) * 0xff * 0.3)|0;

      var rects = [];
      var tilted;

      for (y = 0; y < ey; y += step_y) {

        ii_a = y * w1;

        for (x = 0; x < ex; x += step_x, ii_a += step_x) {

          mean = int_sum[ii_a] - int_sum[ii_a+ii_b] - int_sum[ii_a+ii_c] + int_sum[ii_a+ii_d];

          // canny prune
          if (int_canny_sum) {

            edge_dens = (int_canny_sum[ii_a] - int_canny_sum[ii_a+ii_b] - int_canny_sum[ii_a+ii_c] + int_canny_sum[ii_a+ii_d]);

            if (edge_dens < edges_thresh || mean < 20) {

              x += step_x;
              ii_a += step_x;
              continue;

            }

          }

          mean *= inv_area;
          variance = (int_sqsum[ii_a] - int_sqsum[ii_a+ii_b] - int_sqsum[ii_a+ii_c] + int_sqsum[ii_a+ii_d]) * inv_area - mean * mean;

          std = variance > 0.0 ? Math.sqrt(variance) : 1;

          stages = classifier.complexClassifiers;
          sn = stages.length;
          found =  true;

          for (i = 0; i < sn; ++i) {

            stage = stages[i];
            stage_thresh = stage.threshold;
            trees = stage.simpleClassifiers;
            tn = trees.length;
            stage_sum = 0;

            for (j = 0; j < tn; ++j) {

              tree = trees[j];
              tree_sum = 0;
              features = tree.features;
              fn = features.length;
              tilted = tree.tilted;

              //if ( tree.tilted === 1 ) {
              if ( !!tilted || tilted === 1 ) {

                for (k=0; k < fn; ++k) {

                  feature = features[k];
                  fi_a = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * w1;
                  fw = ~~(feature[2] * scale);
                  fh = ~~(feature[3] * scale);
                  fi_b = fw * w1;
                  fi_c =  fh * w1;

                  tree_sum += (int_tilted[fi_a] - int_tilted[fi_a + fw + fi_b] - int_tilted[fi_a - fh + fi_c] + int_tilted[fi_a + fw - fh + fi_b + fi_c]) * feature[4];

                }

              } else {

                for (k=0; k < fn; ++k) {

                  feature = features[k];
                  fi_a = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * w1;
                  fw = ~~(feature[2] * scale);
                  fh = ~~(feature[3] * scale);
                  fi_c = fh * w1;

                  tree_sum += (int_sum[fi_a] - int_sum[fi_a+fw] - int_sum[fi_a+fi_c] + int_sum[fi_a+fi_c+fw]) * feature[4];

                }

              }

              stage_sum += (tree_sum * inv_area < tree.threshold * std) ? tree.left_val : tree.right_val;

            }

            if (stage_sum < stage_thresh) {

              found = false;
              break;

            }

          }

          if(found) {

            rects.push(
              {
                "x" : x,
                "y" : y,
                "width" : win_w,
                "height" : win_h,
                "neighbor" : 1,
                "confidence" : stage_sum
              });

            x += step_x;
            ii_a += step_x;

          }

        }// for x < ex

      }// y < ey

      return rects;

    };
    /**
     * @deprecated instead use Haar.singleScale
     * @method detect_single_scale
     * @static
     * @param int_sum
     * @param int_sqsum
     * @param int_tilted
     * @param int_canny_sum
     * @param width
     * @param height
     * @param scale
     * @param classifier
     * @return {Array}
     */
    Haar.detect_single_scale = function ( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, scale, classifier ) {

      return Haar.singleScale( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, scale, classifier );

    };
    /**
     * Evaluates a Haar cascade classifier at all scales
     *
     * @method multiScale
     * @static
     *
     * @param {Array} int_sum integral of the source image
     * @param {Array} int_sqsum squared integral of the source image
     * @param {Array} int_tilted tilted integral of the source image
     * @param {Array} int_canny_sum integral of canny source image or undefined
     * @param {number} width width of the source image
     * @param {number} height height of the source image
     * @param {*} classifier haar cascade classifier
     * @param {number=1.2} [scale_factor] how much the image size is reduced at each image scale
     * @param {number=1} [scale_min] start scale
     * @return {Array} rectangles representing detected object
     */
    Haar.multiScale = function ( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, classifier, scale_factor, scale_min ) {

      if (typeof scale_factor === "undefined") { scale_factor = 1.2; }
      if (typeof scale_min === "undefined") { scale_min = 1.0; }

      var win_w = classifier.size[0];
      var win_h = classifier.size[1];
      var rects = [];

      while ( scale_min * win_w < width && scale_min * win_h < height ) {

        rects = rects.concat( Haar.singleScale( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, scale_min, classifier ) );
        scale_min *= scale_factor;

      }

      return rects;

    };
    /**
     * @deprecated instead use Haar.multiScale
     * @method detect_multi_scale
     * @static
     *
     * @param int_sum
     * @param int_sqsum
     * @param int_tilted
     * @param int_canny_sum
     * @param width
     * @param height
     * @param classifier
     * @param scale_factor
     * @param scale_min
     * @return {Array}
     */
    Haar.detect_multi_scale = function ( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, classifier, scale_factor, scale_min ) {

      return Haar.multiScale( int_sum, int_sqsum, int_tilted, int_canny_sum, width, height, classifier, scale_factor, scale_min );

    };
    /**
     * Groups the object candidate rectangles
     *
     * @method rectangles
     * @static
     *
     * @param {Array} rects input candidate objects sequence
     * @param {number=1} [min_neighbors] Minimum possible number of rectangles minus 1, the threshold is used in a group of rectangles to retain it
     * @return {Array}
     */
    Haar.rectangles = function ( rects, min_neighbors ) {

      if (typeof min_neighbors === "undefined") { min_neighbors = 1; }

      var i, j, n = rects.length;
      var node = [];

      for (i = 0; i < n; ++i) {

        node[i] = {
          "parent" : -1,
          "element" : rects[i],
          "rank" : 0};

      }

      for (i = 0; i < n; ++i) {

        if (!node[i].element) {

          continue;

        }

        var root = i;
        while (node[root].parent !== -1) {

          root = node[root].parent;

        }

        for (j = 0; j < n; ++j) {

          if ( i !== j && node[j].element && _group_func(node[i].element, node[j].element) ) {

            var root2 = j;

            while (node[root2].parent !== -1) {

              root2 = node[root2].parent;

            }

            if (root2 !== root) {

              if (node[root].rank > node[root2].rank) {

                node[ root2 ].parent = root;

              } else {

                node[root].parent = root2;

                if (node[root].rank === node[root2].rank) {

                  node[root2].rank++;

                }

                root = root2;

              }

              /* compress path from node2 to the root: */
              var temp, node2 = j;

              while (node[node2].parent !== -1) {

                temp = node2;
                node2 = node[node2].parent;
                node[temp].parent = root;

              }

              /* compress path from node to the root: */
              node2 = i;
              while (node[node2].parent !== -1) {

                temp = node2;
                node2 = node[node2].parent;
                node[temp].parent = root;

              }

            }

          }

        }

      }

      var idx_seq = [];
      var class_idx = 0;

      for (i = 0; i < n; i++) {

        j = -1;
        var node1 = i;

        if(node[node1].element) {

          while (node[node1].parent !== -1) {

            node1 = node[node1].parent;

          }

          if (node[node1].rank >= 0) {

            node[node1].rank = ~class_idx++;

          }

          j = ~node[node1].rank;

        }

        idx_seq[i] = j;

      }

      var comps = [];

      for (i = 0; i < class_idx+1; ++i) {

        comps[i] = {
          "neighbors" : 0,
          "x" : 0,
          "y" : 0,
          "width" : 0,
          "height" : 0,
          "confidence" : 0
        };

      }

      // count number of neighbors
      var idx;
      for(i = 0; i < n; ++i) {

        r1 = rects[i];
        idx = idx_seq[i];

        if (comps[idx].neighbors === 0) {

          comps[idx].confidence = r1.confidence;

        }

        ++comps[idx].neighbors;

        comps[idx].x += r1.x;
        comps[idx].y += r1.y;
        comps[idx].width += r1.width;
        comps[idx].height += r1.height;
        comps[idx].confidence = Math.max(comps[idx].confidence, r1.confidence);

      }

      var seq2 = [];
      // calculate average bounding box
      for(i = 0; i < class_idx; ++i) {

        n = comps[i].neighbors;

        if (n >= min_neighbors) {

          seq2.push({
            "x" : (comps[i].x * 2 + n) / (2 * n),
            "y" : (comps[i].y * 2 + n) / (2 * n),
            "width" : (comps[i].width * 2 + n) / (2 * n),
            "height" : (comps[i].height * 2 + n) / (2 * n),
            "neighbors" : comps[i].neighbors,
            "confidence" : comps[i].confidence
          });

        }

      }

      var result_seq = [];
      n = seq2.length;

      // filter out small face rectangles inside large face rectangles
      for(i = 0; i < n; ++i) {

        var r1 = seq2[i];
        var flag = true;

        for (j = 0; j < n; ++j) {

          var r2 = seq2[j];
          var distance = (r2.width * 0.25 + 0.5)|0;

          if ( i !== j &&
              r1.x >= r2.x - distance &&
              r1.y >= r2.y - distance &&
              r1.x + r1.width <= r2.x + r2.width + distance &&
              r1.y + r1.height <= r2.y + r2.height + distance &&
              (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3) ) {

            flag = false;
            break;

          }

        }

        if(flag) {

          result_seq.push(r1);

        }

      }

      return result_seq;

    };
    //Haar.groupRectangles = function ( rects, min_neighbors ) {
    //
    //
    //
    //};
    /**
     * @deprecated instead use Haar.rectangles
     * @method group_rectangles
     * @static
     * @param rects
     * @param min_neighbors
     * @return {Array}
     */
    Haar.group_rectangles = function ( rects, min_neighbors ) {

      return Haar.rectangles( rects, min_neighbors );

    };

    return Haar;

  }() );

}( window ) );
///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/10 - 18:31
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
/*jslint -W017*/
/**
 * original code
 * http://inspirit.github.io/jsfeat/
 *
 * this code is a rewrite from https://github.com/liuliu/ccv implementation
 * author Liu Liu / http://liuliu.me/
 *
 * The original paper refers to: YEF∗ Real-Time Object Detection, Yotam Abramson and Bruno Steux
 *
 * @module Igata
 * @submodule Feat
 */
( function ( window ) {

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;


  global.Bbf = ( function () {

    var Processing = global.Processing;
    var Matrix_t = global.Matrix_t;
    var U8_t = global.U8_t;
    var C1_t = global.C1_t;

    var _pow = global._pow;
    var _log = global._log;
    var _min = global._min;

    // ------------------------------------------------------------------
    // private
    // ------------------------------------------------------------------
    /**
     * @for Bbf
     * @method _group_func
     * @static
     * @param r1
     * @param r2
     * @return {boolean|number}
     * @private
     */
    function _group_func (r1, r2) {

      var distance = (r1.width * 0.25 + 0.5)|0;

      return r2.x <= r1.x + distance &&
        r2.x >= r1.x - distance &&
        r2.y <= r1.y + distance &&
        r2.y >= r1.y - distance &&
        r2.width <= (r1.width * 1.5 + 0.5)|0 &&
        (r2.width * 1.5 + 0.5)|0 >= r1.width;

    }

    /**
     * @for Bbf
     * @property img_pyr
     * @static
     * @private
     * @type {Pyramid_t|*}
     */
    var img_pyr = new Igata.Pyramid_t( 1 );

    // ------------------------------------------------------------------
    // Class
    // ------------------------------------------------------------------
    /**
     * ## Brightness Binary Feature object detector
     *
     * The original paper refers to: YEF∗ Real-Time Object Detection, Yotam Abramson and Bruno Steux.
     *
     * @class Bbf
     * @static
     * @constructor
     */
    function Bbf () {
      throw new Error( 'Bbf can\'t create instance.' );
    }

    var p = Bbf.prototype;
    p.constructor = Bbf;

    /**
     * @property interval
     * @static
     * @type {number}
     * @default 4
     */
    Bbf.interval = 4;
    /**
     * @property scale
     * @static
     * @type {number}
     * @default 1.1486
     */
    Bbf.scale = 1.1486;
    /**
     * @property next
     * @static
     * @type {number}
     * @default 5
     */
    Bbf.next = 5;
    /**
     * @property scaleTo
     * @static
     * @type {number}
     * @default 1
     */
    Bbf.scaleTo = 1;

    /**
     * @deprecated instead use Bbf.scaleTo
     * @property scale_to
     * @static
     * @type {number}
     */
    Bbf.scale_to = Bbf.scaleTo;

    /**
     * This step needed only once to create
     *
     * local copy of features to prevent multiple
     *
     * Array relocation during detection
     *
     * @method prepare
     * @static
     * @param {*} cascade detect target cascade data
     */
    Bbf.prepare = function ( cascade ) {

      var sn = cascade.stage_classifier.length;

      for (var j = 0; j < sn; j++) {

        var orig_feature = cascade.stage_classifier[j].feature;
        var f_cnt = cascade.stage_classifier[j].count;
        var feature = cascade.stage_classifier[j]._feature = new Array(f_cnt);

        for (var k = 0; k < f_cnt; k++) {

          feature[k] = {
            "size" : orig_feature[k].size,
            "px" : new Array(orig_feature[k].size),
            "pz" : new Array(orig_feature[k].size),
            "nx" : new Array(orig_feature[k].size),
            "nz" : new Array(orig_feature[k].size)
          };

        }

      }

    };

    /**
     * @deprecated instead use Bbf.prepare
     * @method prepare_cascade
     * @static
     * @param cascade
     */
    Bbf.prepare_cascade = function ( cascade ) {

      Bbf.prepare( cascade );

    };

    /**
     * @method pyramid
     * @static
     * @param {Matrix_t} src source grayscale Matrix_t (U8_t|C1_t)
     * @param {number} min_width minimum width to scale pyramid to
     * @param {number} min_height minimum height to scale pyramid to
     * @param {number=4} [interval] number of original scale levels in pyramid
     * @return {Pyramid_t|*}
     */
    Bbf.pyramid = function ( src, min_width, min_height, interval ) {

      if (typeof interval === "undefined") { interval = 4; }

      var sw=src.cols,sh=src.rows;
      var i=0,nw=0,nh=0;
      var new_pyr=false;
      var src0=src,src1=src;
      var data_type = U8_t | C1_t;
      var scale;

      Bbf.interval = interval;
      scale = _pow(2, 1 / (interval + 1));
      Bbf.scale = scale;
      Bbf.next = (interval + 1)|0;
      Bbf.scaleTo = ( _log( _min(sw / min_width, sh / min_height)) / _log(scale))|0;

      var pyr_l = ((Bbf.scaleTo + Bbf.next * 2) * 4) | 0;
      var limit;

      if ( img_pyr.levels !== pyr_l ) {

        img_pyr.levels = pyr_l;
        img_pyr.data = new Array(pyr_l);
        new_pyr = true;
        img_pyr.data[0] = src; // first is src

      }

      limit = interval;
      for ( i = 1; i <= limit; ++i ) {

        nw = (sw / _pow(scale, i))|0;
        nh = (sh / _pow(scale, i))|0;

        src0 = img_pyr.data[i<<2];

        if ( new_pyr || nw !== src0.cols || nh !== src0.rows ) {

          img_pyr.data[i<<2] = new Matrix_t(nw, nh, data_type);
          src0 = img_pyr.data[i<<2];

        }

        Processing.resample(src, src0, nw, nh);

      }

      limit = Bbf.scaleTo + Bbf.next * 2;
      for ( i = Bbf.next; i < limit; ++i ) {

        src1 = img_pyr.data[(i << 2) - (this.next << 2)];
        src0 = img_pyr.data[i<<2];
        nw = src1.cols >> 1;
        nh = src1.rows >> 1;

        if ( new_pyr || nw !== src0.cols || nh !== src0.rows ) {

          img_pyr.data[i<<2] = new Matrix_t(nw, nh, data_type);
          src0 = img_pyr.data[i<<2];

        }

        Processing.pyrdown(src1, src0);

      }

      limit = Bbf.scaleTo + Bbf.next * 2;
      for ( i = Bbf.next * 2; i < limit; ++i ) {

        src1 = img_pyr.data[(i << 2) - (this.next << 2)];
        nw = src1.cols >> 1;
        nh = src1.rows >> 1;
        src0 = img_pyr.data[(i<<2)+1];

        if ( new_pyr || nw !== src0.cols || nh !== src0.rows ) {

          img_pyr.data[(i<<2)+1] = new Matrix_t(nw, nh, data_type);
          src0 = img_pyr.data[(i<<2)+1];

        }

        Processing.pyrdown(src1, src0, 1, 0);


        src0 = img_pyr.data[(i<<2)+2];

        if (new_pyr || nw !== src0.cols || nh !== src0.rows) {

          img_pyr.data[(i<<2)+2] = new Matrix_t(nw, nh, data_type);
          src0 = img_pyr.data[(i<<2)+2];

        }

        Processing.pyrdown(src1, src0, 0, 1);


        src0 = img_pyr.data[(i<<2)+3];
        if ( new_pyr || nw !== src0.cols || nh !== src0.rows ) {

          img_pyr.data[(i<<2)+3] = new Matrix_t(nw, nh, data_type);
          src0 = img_pyr.data[(i<<2)+3];

        }

        Processing.pyrdown(src1, src0, 1, 1);

      }

      return img_pyr;

    };
    /**
     * Build image pyramid using canvas drawImage
     *
     * @deprecated instead use Bbf.pyramid
     * @method build_pyramid
     * @static
     * @param src
     * @param min_width
     * @param min_height
     * @param interval
     */
    Bbf.build_pyramid = function ( src, min_width, min_height, interval ) {

      return Bbf.pyramid( src, min_width, min_height, interval );

    };
    /**
     * Run detection
     *
     * @method detect
     * @static
     * @param {Pyramid_t} pyramid Pyramid_t from Bbf.pyramid method
     * @param {*} cascade cascade data
     * @return {Array}
     */
    Bbf.detect = function ( pyramid, cascade ) {

      //var interval = Bbf.interval;
      var scale = Bbf.scale;
      var next = Bbf.next;
      var scale_upto = Bbf.scaleTo;
      var i=0,j=0,k=0,n=0,x=0,y=0,q=0,sn=0,f_cnt=0,q_cnt=0,p=0,pmin=0,nmax=0,f=0,i4=0,qw=0,qh=0;
      var sum=0.0, alpha, feature, orig_feature, feature_k, feature_o, flag = true, shortcut=true;
      var scale_x = 1.0, scale_y = 1.0;
      var dx = [0, 1, 0, 1];
      var dy = [0, 0, 1, 1];
      var seq = [];
      var pyr=pyramid.data, bpp = 1, bpp2 = 2, bpp4 = 4;

      var u8 = [], u8o = [0,0,0];
      var step = [0,0,0];
      var paddings = [0,0,0];

      for (i = 0; i < scale_upto; i++) {

        i4 = (i<<2);
        qw = pyr[i4 + (next << 3)].cols - (cascade.width >> 2);
        qh = pyr[i4 + (next << 3)].rows - (cascade.height >> 2);
        step[0] = pyr[i4].cols * bpp;
        step[1] = pyr[i4 + (next << 2)].cols * bpp;
        step[2] = pyr[i4 + (next << 3)].cols * bpp;
        paddings[0] = (pyr[i4].cols * bpp4) - (qw * bpp4);
        paddings[1] = (pyr[i4 + (next << 2)].cols * bpp2) - (qw * bpp2);
        paddings[2] = (pyr[i4 + (next << 3)].cols * bpp) - (qw * bpp);
        sn = cascade.stage_classifier.length;

        for (j = 0; j < sn; j++) {

          orig_feature = cascade.stage_classifier[j].feature;
          feature = cascade.stage_classifier[j]._feature;
          f_cnt = cascade.stage_classifier[j].count;

          for (k = 0; k < f_cnt; k++) {

            feature_k = feature[k];
            feature_o = orig_feature[k];
            q_cnt = feature_o.size|0;

            for (q = 0; q < q_cnt; q++) {

              feature_k.px[q] = (feature_o.px[q] * bpp) + feature_o.py[q] * step[feature_o.pz[q]];
              feature_k.pz[q] = feature_o.pz[q];
              feature_k.nx[q] = (feature_o.nx[q] * bpp) + feature_o.ny[q] * step[feature_o.nz[q]];
              feature_k.nz[q] = feature_o.nz[q];

            }

          }

        }

        u8[0] = pyr[i4].data;
        u8[1] = pyr[i4 + (next<<2)].data;

        for (q = 0; q < 4; q++) {

          u8[2] = pyr[i4 + (next<<3) + q].data;
          u8o[0] = (dx[q]*bpp2) + dy[q] * (pyr[i4].cols*bpp2);
          u8o[1] = (dx[q]*bpp) + dy[q] * (pyr[i4 + (next<<2)].cols*bpp);
          u8o[2] = 0;

          for (y = 0; y < qh; y++) {

            for (x = 0; x < qw; x++) {

              sum = 0;
              flag = true;
              sn = cascade.stage_classifier.length;

              for (j = 0; j < sn; j++) {

                sum = 0;
                alpha = cascade.stage_classifier[j].alpha;
                feature = cascade.stage_classifier[j]._feature;
                f_cnt = cascade.stage_classifier[j].count;

                for (k = 0; k < f_cnt; k++) {

                  feature_k = feature[k];
                  pmin = u8[feature_k.pz[0]][u8o[feature_k.pz[0]] + feature_k.px[0]];
                  nmax = u8[feature_k.nz[0]][u8o[feature_k.nz[0]] + feature_k.nx[0]];

                  if (pmin <= nmax) {

                    sum += alpha[k << 1];

                  } else {

                    shortcut = true;
                    q_cnt = feature_k.size;

                    for (f = 1; f < q_cnt; f++) {

                      if (feature_k.pz[f] >= 0) {

                        p = u8[feature_k.pz[f]][u8o[feature_k.pz[f]] + feature_k.px[f]];

                        if (p < pmin) {

                          if (p <= nmax) {

                            shortcut = false;
                            break;

                          }

                          pmin = p;

                        }

                      }

                      if (feature_k.nz[f] >= 0) {

                        n = u8[feature_k.nz[f]][u8o[feature_k.nz[f]] + feature_k.nx[f]];

                        if (n > nmax) {

                          if (pmin <= n) {

                            shortcut = false;
                            break;

                          }

                          nmax = n;

                        }

                      }

                    }

                    sum += (shortcut) ? alpha[(k << 1) + 1] : alpha[k << 1];

                  }

                }

                if (sum < cascade.stage_classifier[j].threshold) {

                  flag = false;
                  break;

                }

              }

              if (flag) {

                seq.push({
                  "x" : (x * 4 + dx[q] * 2) * scale_x,
                  "y" : (y * 4 + dy[q] * 2) * scale_y,
                  "width" : cascade.width * scale_x,
                  "height" : cascade.height * scale_y,
                  "neighbor" : 1,
                  "confidence" : sum
                });
                ++x;
                u8o[0] += bpp4;
                u8o[1] += bpp2;
                u8o[2] += bpp;

              }

              u8o[0] += bpp4;
              u8o[1] += bpp2;
              u8o[2] += bpp;

            }// for x < qw

            u8o[0] += paddings[0];
            u8o[1] += paddings[1];
            u8o[2] += paddings[2];

          }// for y < qh

        }// for q < 4

        scale_x *= scale;
        scale_y *= scale;

      }

      return seq;

    };

    /**
     * @method rectangles
     * @static
     * @param {Array} rects input candidate objects sequence
     * @param {number=1} [min_neighbors] Minimum possible number of rectangles minus 1, the threshold is used in a group of rectangles to retain it
     * @return {Array}
     */
    Bbf.rectangles = function ( rects, min_neighbors ) {

      if (typeof min_neighbors === "undefined") { min_neighbors = 1; }

      var i, j, n = rects.length;
      var node = [];

      for (i = 0; i < n; ++i) {

        node[i] = {
          "parent" : -1,
          "element" : rects[i],
          "rank" : 0
        };

      }

      for (i = 0; i < n; ++i) {

        if (!node[i].element) {

          continue;

        }

        var root = i;
        while (node[root].parent !== -1) {

          root = node[root].parent;

        }

        for (j = 0; j < n; ++j) {

          if ( i !== j && node[j].element && _group_func(node[i].element, node[j].element)) {

            var root2 = j;

            while (node[root2].parent !== -1) {

              root2 = node[root2].parent;

            }

            if (root2 !== root) {

              if (node[root].rank > node[root2].rank) {

                node[root2].parent = root;

              } else {

                node[root].parent = root2;

                if (node[root].rank === node[root2].rank) {

                  node[root2].rank++;

                }

                root = root2;

              }

              /* compress path from node2 to the root: */
              var temp, node2 = j;

              while (node[node2].parent !== -1) {

                temp = node2;
                node2 = node[node2].parent;
                node[temp].parent = root;

              }

              /* compress path from node to the root: */
              node2 = i;
              while (node[node2].parent !== -1) {

                temp = node2;
                node2 = node[node2].parent;
                node[temp].parent = root;

              }

            }// if root2 !== root

          }// if

        }// for j

      }// for i

      var idx_seq = [];
      var class_idx = 0;

      for (i = 0; i < n; i++) {

        j = -1;
        var node1 = i;

        if (node[node1].element) {

          while (node[node1].parent !== -1) {

            node1 = node[node1].parent;

          }

          if (node[node1].rank >= 0) {

            node[node1].rank = ~class_idx++;

          }

          j = ~node[node1].rank;

        }

        idx_seq[i] = j;

      }

      var comps = [];
      var limit = class_idx+1;
      var idx;

      for (i = 0; i < limit; ++i) {

        comps[i] = {
          "neighbors" : 0,
          "x" : 0,
          "y" : 0,
          "width" : 0,
          "height" : 0,
          "confidence" : 0
        };

      }

      // count number of neighbors
      for (i = 0; i < n; ++i) {

        r1 = rects[i];
        idx = idx_seq[i];

        if (comps[idx].neighbors === 0) {

          comps[idx].confidence = r1.confidence;

        }

        ++comps[idx].neighbors;

        comps[idx].x += r1.x;
        comps[idx].y += r1.y;
        comps[idx].width += r1.width;
        comps[idx].height += r1.height;
        comps[idx].confidence = Math.max(comps[idx].confidence, r1.confidence);

      }

      var seq2 = [];
      // calculate average bounding box
      for(i = 0; i < class_idx; ++i) {

        n = comps[i].neighbors;

        if (n >= min_neighbors) {

          seq2.push({
            "x" : (comps[i].x * 2 + n) / (2 * n),
            "y" : (comps[i].y * 2 + n) / (2 * n),
            "width" : (comps[i].width * 2 + n) / (2 * n),
            "height" : (comps[i].height * 2 + n) / (2 * n),
            "neighbors" : comps[i].neighbors,
            "confidence" : comps[i].confidence
          });

        }
      }

      var result_seq = [];
      n = seq2.length;
      // filter out small face rectangles inside large face rectangles
      for (i = 0; i < n; ++i) {

        var r1 = seq2[i];
        var flag = true;

        for (j = 0; j < n; ++j) {

          var r2 = seq2[j];
          var distance = (r2.width * 0.25 + 0.5)|0;

          if ( i !== j &&
              r1.x >= r2.x - distance &&
              r1.y >= r2.y - distance &&
              r1.x + r1.width <= r2.x + r2.width + distance &&
              r1.y + r1.height <= r2.y + r2.height + distance &&
              (r2.neighbors > Math.max(3, r1.neighbors) || r1.neighbors < 3) ) {

            flag = false;
            break;

          }

        }

        if (flag) {

          result_seq.push(r1);

        }

      }

      return result_seq;

    };
    /**
     * @deprecated instead use Bbf.rectangles
     * @method group_rectangles
     * @static
     * @param rects
     * @param min_neighbors
     * @return {Array}
     */
    Bbf.group_rectangles = function ( rects, min_neighbors ) {

      return Bbf.rectangles( rects, min_neighbors );

    };

    return Bbf;

  }() );

}( window ) );