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