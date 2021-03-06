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
      if (typeof code === 'undefined') { code = COLOR_RGBA2GRAY; }

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

      if (typeof options === 'undefined') { options = 0; }

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

      if (typeof sigma === 'undefined') { sigma = 0.0; }

      if (typeof kernel_size === 'undefined') { kernel_size = 0; }

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
      if (typeof sx === 'undefined') { sx = 0; }
      if (typeof sy === 'undefined') { sy = 0; }

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

      if (typeof fill_value === 'undefined') { fill_value = 0; }

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

      if (typeof fill_value === 'undefined') { fill_value = 0; }

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

      if (typeof skip_first_level === 'undefined') { skip_first_level = true; }

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