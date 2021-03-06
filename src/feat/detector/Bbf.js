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

      if (typeof interval === 'undefined') { interval = 4; }

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

      if (typeof min_neighbors === 'undefined') { min_neighbors = 1; }

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