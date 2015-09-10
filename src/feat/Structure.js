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