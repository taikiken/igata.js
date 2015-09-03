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

      var
        r = 0,
        g = 0,
        b = 0,
        a = 0,
        next = null;

      Object.defineProperties(
        this,
        {
          /**
           * @property r
           * @type {number}
           */
          'r': {
            get: function () {

              return r;

            },
            set: function ( value ) {

              r = value;

            }
          },
          /**
           * @property g
           * @type {number}
           */
          'g': {
            get: function () {

              return g;

            },
            set: function ( value ) {

              g = value;

            }
          },
          /**
           * @property b
           * @type {number}
           */
          'b': {
            get: function () {

              return b;

            },
            set: function ( value ) {

              b = value;

            }
          },
          /**
           * @property a
           * @type {number}
           */
          'a': {
            get: function () {

              return a;

            },
            set: function ( value ) {

              a = value;

            }
          },
          /**
           * @property next
           * @type {number}
           */
          'next': {
            get: function () {

              return next;

            },
            set: function ( value ) {

              next = value;

            }
          }
        }
      );

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
          //this._rgb( data, radius, 720, 450 );

        }

        var out = Date.now();

        //console.log( 'time: ', (out-time) / 1000 );
        //
        //console.log( '************** end ', out );

        // ToDo; Chrome very slow...

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

        for( i = 0; i < radiusPlus1; i = (i+1)|0 ) {

          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack.a = pa;
          stack = stack.next;

        }

        yp = width;

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

        for( i = 0; i < radiusPlus1; i = (i+1)|0 ) {

          stack.r = pr;
          stack.g = pg;
          stack.b = pb;
          stack = stack.next;

        }

        yp = width;

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

          p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

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