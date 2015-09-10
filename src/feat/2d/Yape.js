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

  var Yape = ( function () {

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
      for ( y = 0; y < x; y++, i++) {
        
        x = (Math.sqrt((R * R - y * y)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( x-- ; x < y && x >= 0; x--, i++) {
        
        y = (Math.sqrt((R * R - x * x)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for (  ; -x < y; x--, i++) {
        
        y = (Math.sqrt((R * R - x * x)) + 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( y-- ; y >= 0; y--, i++) {
        
        x = (-Math.sqrt((R * R - y * y)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( ; y > x; y--, i++) {
        
        x = (-Math.sqrt((R * R - y * y)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( x++ ; x <= 0; x++, i++) {
        
        y = (-Math.sqrt((R * R - x * x)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for (  ; x < -y; x++, i++) {
        
        y = (-Math.sqrt((R * R - x * x)) - 0.5)|0;
        dirs[i] = (x + step * y);
        
      }
      
      for ( y++ ; y < 0; y++, i++) {
        
        x = (Math.sqrt((R * R - y * y)) + 0.5)|0;
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
      if (Sb[off+1]      !== 0) {n++;}
      if (Sb[off-1]      !== 0) {n++;}
      if (Sb[off+step]   !== 0) {n++;}
      if (Sb[off+step+1] !== 0) {n++;}
      if (Sb[off+step-1] !== 0) {n++;}
      if (Sb[off-step]   !== 0) {n++;}
      if (Sb[off-step+1] !== 0) {n++;}
      if (Sb[off-step-1] !== 0) {n++;}

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
      radius = Math.min(radius, 7);
      radius = Math.max(radius, 3);

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

      var sx = Math.max(R+1, border)|0;
      var sy = Math.max(R+1, border)|0;
      var ex = Math.min(w-R-2, w-border)|0;
      var ey = Math.min(h-R-2, h-border)|0;

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

  global.Yape = Yape;

}( window ) );