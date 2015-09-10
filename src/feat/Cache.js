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