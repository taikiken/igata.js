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