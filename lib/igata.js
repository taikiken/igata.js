/**
 * @license inazumatv.com
 * @author (at)taikiken / http://inazumatv.com
 * @date 2015/04/20 - 16:51
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
 * @version 0.0.1
 * @build 2015-04-20 22:38:20
 * @git https://github.com/taikiken/igata.js
 *
 * @module igata
 */

var igata = window.igata || {};

( function ( window ){
  "use strict";

  var
    igata = window.igata;

  // alias methods
  igata.Float32Array = window.Float32Array;

  igata._random = Math.random;

  igata._abs = Math.abs;

  igata._min = Math.min;

  igata._max = Math.max;

  igata._sqrt = Math.sqrt;

  igata._cos = Math.cos;

  igata._sin = Math.sin;

  igata._PI = Math.PI;

  /**
   * @property EPSILON
   * @for igata
   * @static
   * @readonly
   * @type {number}
   * @default 0.000001
   */
  igata.EPSILON = 0.000001;

  /**
   * @method extend
   * @for igata
   * @static
   * @param {function} Parent
   * @param {function} Child
   */
  igata.extend = function ( Parent, Child ) {

    Child.prototype = Object.create( Parent.prototype );
    Child.prototype.constructor = Child;

  };

}( window ) );

/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/04/20 - 20:55
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
( function ( window ){
  "use strict";

  var
    igata = window.igata;

  igata.IVector = ( function (){

    /**
     * Interface Vector
     * @class IVector
     * @constructor
     */
    function IVector () {

    }

    var p = IVector.prototype;

    p.constructor = IVector;

    IVector.create  =function () {};
    IVector.clone  =function () {};
    IVector.copy  =function () {};
    IVector.value  =function () {};
    IVector.set  =function () {};
    IVector.sub  =function () {};
    IVector.subtract  =function () {};
    IVector.mul  =function () {};
    IVector.multiply  =function () {};
    IVector.mulScalar  =function () {};
    IVector.div  =function () {};
    IVector.divide  =function () {};
    IVector.divScalar  =function () {};
    IVector.min  =function () {};
    IVector.max  =function () {};
    IVector.scale  =function () {};
    IVector.distanceSquare  =function () {};
    IVector.distance  =function () {};
    IVector.lengthSquare  =function () {};
    IVector.length  =function () {};
    IVector.negate  =function () {};
    IVector.inverse  =function () {};
    IVector.normalize  =function () {};
    IVector.dot  =function () {};
    IVector.cross  =function () {};
    IVector.lerp  =function () {};
    IVector.random  =function () {};

    return IVector;
  }() );

}( window ) );
/**
 * license inazumatv.com
 * author (at)taikiken / http://inazumatv.com
 * date 2015/04/20 - 17:01
 *
 * Copyright (c) 2011-2015 inazumatv.com, inc.
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
/*jslint -W030 */
( function ( window ){
  "use strict";

  var
    igata = window.igata;

  igata.Vector2 = ( function (){
    var
      IVector = igata.IVector,
      Float32Array = igata.Float32Array,
      _min = igata._min,
      _max = igata._max,
      _sqrt = igata._sqrt,
      _random = igata._random,
      _cos = igata._cos,
      _sin = igata._sin,
      _PI = igata._PI;

    /**
     * @class Vector2
     * @extends IVector
     * @param {number=0} [x]
     * @param {number=0} [y]
     * @constructor
     */
    function Vector2 ( x, y ) {
      IVector.call( this );
      var
        vec2 = new Float32Array( 2 );

      vec2[ 0 ] = x || 0;
      vec2[ 1 ] = y || 0;
      /**
       * @property _vec2
       * @type {Float32Array}
       * @private
       */
      this._vec2 = vec2;
      /**
       * @property _x
       * @type {number}
       * @private
       */
      this._x = x;
      /**
       * @property _y
       * @type {number}
       * @private
       */
      this._y = y;
    }

    igata.extend( IVector, Vector2 );

    var p = Vector2.prototype;

    p.constructor = Vector2;

    /**
     * @method x
     * @return {number}
     */
    p.x = function () {
      return this._x;
    };
    /**
     * @method y
     * @return {number}
     */
    p.y = function () {
      return this._y;
    };
    /**
     * @method get
     * @return {Float32Array}
     */
    p.get = function () {

      return this._vec2;

    };

    /**
     * @method create
     * @static
     * @return {Float32Array}
     */
    Vector2.create = function () {

      var
        vec2 = new Float32Array( 2 );

      vec2[ 0 ] = 0;
      vec2[ 1 ] = 0;

      return vec2;

    };

    /**
     * @method clone
     * @static
     * @param {Float32Array} vec2
     * @return {Float32Array}
     */
    Vector2.clone = function ( vec2 ) {

      var
        copied = new Float32Array( 2 );

      copied[ 0 ] = vec2[ 0 ];
      copied[ 1 ] = vec2[ 1 ];

      return copied;

    };
    /**
     * @method copy
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} sender
     * @return {Float32Array}
     */
    Vector2.copy = function ( receiver, sender ) {

      receiver[ 0 ] = sender[ 0 ];
      receiver[ 1 ] = sender[ 1 ];

      return receiver;

    };
    /**
     * @method value
     * @static
     * @param {number} x
     * @param {number} y
     * @return {Float32Array}
     */
    Vector2.value = function ( x, y ) {

      var
        vec2 = new Float32Array( 2 );

      vec2[ 0 ] = x;
      vec2[ 1 ] = y;

      return vec2;

    };
    /**
     * @method set
     * @static
     * @param {Float32Array} receiver
     * @param {number} x
     * @param {number} y
     * @return {Float32Array}
     */
    Vector2.set = function ( receiver, x, y ) {

      receiver[ 0 ] = x;
      receiver[ 1 ] = y;

      return receiver;

    };

    /**
     * @method add
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.add = function ( receiver, vector1, vector2 ) {

      receiver[ 0 ] = vector1[ 0 ] + vector2[ 0 ];
      receiver[ 1 ] = vector1[ 1 ] + vector2[ 1 ];

      return receiver;

    };

    /**
     * @method sub
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.sub = function ( receiver, vector1, vector2 ) {

      receiver[ 0 ] = vector1[ 0 ] - vector2[ 0 ];
      receiver[ 1 ] = vector1[ 1 ] - vector2[ 1 ];

      return receiver;

    };

    /**
     * alias Vector2.sub
     * @method subtract
     * @static
     * @link Vector2.sub
     * @type {Function}
     */
    Vector2.subtract = Vector2.sub;

    /**
     * multiply
     * @method mul
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.mul = function ( receiver, vector1, vector2 ) {

      receiver[ 0 ] = vector1[ 0 ] * vector2[ 0 ];
      receiver[ 1 ] = vector1[ 1 ] * vector2[ 1 ];

      return receiver;

    };

    /**
     * alias Vector2.mul
     * @method multiply
     * @static
     * @link Vector2.mul
     * @type {Function}
     */
    Vector2.multiply = Vector2.mul;

    /**
     * @method divScalar
     * @static
     * @param {Float32Array} receiver
     * @param {number} scalar
     * @return {Float32Array}
     */
    Vector2.mulScalar = function ( receiver, scalar ) {

      receiver[ 0 ] *= scalar;
      receiver[ 1 ] *= scalar;

      return receiver;

    };

    /**
     * @method div
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.div = function ( receiver, vector1, vector2 ) {

      receiver[ 0 ] = vector1[ 0 ] / vector2[ 0 ];
      receiver[ 1 ] = vector1[ 1 ] / vector2[ 1 ];

      return receiver;

    };

    /**
     * alias Vector2.div
     * @method divide
     * @static
     * @link Vector2.div
     * @type {Function}
     */
    Vector2.divide = Vector2.div;

    /**
     * @method divScalar
     * @static
     * @param {Float32Array} receiver
     * @param {number} scalar
     * @return {Float32Array}
     */
    Vector2.divScalar = function ( receiver, scalar ) {

      var
        x = 0,
        y = 0,
        invScalar;

      if ( scalar !== 0 ) {

        invScalar = 1 / scalar;
        x = receiver[ 0 ];
        y = receiver[ 1 ];
        x *= invScalar;
        y *= invScalar;

      }

      receiver[ 0 ] = x;
      receiver[ 1 ] = y;

      return receiver;

    };

    /**
     * @method min
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.min = function ( receiver, vector1, vector2 ) {

      receiver[ 0 ] = _min( vector1[ 0 ], vector2[ 0 ] );
      receiver[ 1 ] = _min( vector1[ 1 ], vector2[ 1 ] );

      return receiver;

    };

    /**
     * @method max
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.max = function ( receiver, vector1, vector2 ) {

      receiver[ 0 ] = _max( vector1[ 0 ], vector2[ 0 ] );
      receiver[ 1 ] = _max( vector1[ 1 ], vector2[ 1 ] );

      return receiver;

    };
    /**
     * @method max
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {number} scale
     * @return {Float32Array}
     */
    Vector2.scale = function ( receiver, vector1, scale ) {

      receiver[ 0 ] = vector1[ 0 ] * scale;
      receiver[ 1 ] = vector1[ 1 ] * scale;

      return receiver;

    };

    /**
     * @method distanceSquare
     * @static
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {number}
     */
    Vector2.distanceSquare = function ( vector1, vector2 ) {

      var
        x = vector2[ 0 ] - vector1[ 0 ],
        y = vector2[ 1 ] - vector1[ 1 ];

      return  x * x + y * y;

    };

    /**
     * @method distance
     * @static
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {number}
     */
    Vector2.distance = function ( vector1, vector2 ) {

      return _sqrt( Vector2.distanceSquare( vector1, vector2 ) );

    };

    /**
     * @method lengthSquare
     * @static
     * @param {Float32Array} vector1
     * @return {number}
     */
    Vector2.lengthSquare = function ( vector1 ) {

      var
        x = vector1[ 0 ],
        y = vector1[ 1 ];

      return x * x + y * y;

    };

    /**
     * @method length
     * @static
     * @param {Float32Array} vector1
     * @return {number}
     */
    Vector2.length = function ( vector1 ) {

      return _sqrt( Vector2.lengthSquare( vector1 ) );

    };

    /**
     * ベクトルの値を反転
     * @method negate
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @return {Float32Array}
     */
    Vector2.negate = function ( receiver, vector1 ) {

      receiver[ 0 ] = -vector1[ 0 ];
      receiver[ 1 ] = -vector1[ 1 ];

      return receiver;

    };

    /**
     * @method inverse
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @return {Float32Array}
     */
    Vector2.inverse = function ( receiver, vector1 ) {

      receiver[ 0 ] = 1.0 / vector1[ 0 ];
      receiver[ 1 ] = 1.0 / vector1[ 1 ];

      return receiver;

    };

    /**
     * @method normalize
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @return {Float32Array}
     */
    Vector2.normalize = function ( receiver, vector1 ) {

      return Vector2.divScalar( receiver, Vector2.length( vector1 ) );

    };

    /**
     * 内積を計算
     * @method dot
     * @static
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {number}
     */
    Vector2.dot = function ( vector1, vector2 ) {

      return vector1[ 0 ] * vector2[ 0 ] + vector1[ 1 ] + vector2[ 1 ];

    };

    /**
     * @method cross
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @return {Float32Array}
     */
    Vector2.cross = function ( receiver, vector1, vector2 ) {

      var
        z = vector1[ 0 ] * vector2[ 1 ] - vector1[ 1 ] * vector2[ 1 ];

      receiver[ 0 ] = receiver[ 1 ] = 0;
      receiver[ 2 ] = z;

      return receiver;

    };

    /**
     * @method lerp
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector1
     * @param {Float32Array} vector2
     * @param {number} alpha
     * @return {Float32Array}
     */
    Vector2.lerp = function ( receiver, vector1, vector2, alpha ) {

      var
        x = vector1[ 0 ],
        y = vector1[ 1 ];

      receiver[ 0 ] = x + alpha * ( vector2[ 0 ] - x );
      receiver[ 1 ] = y + alpha * ( vector2[ 1 ] - y );

      return receiver;

    };

    /**
     * @method random
     * @static
     * @param {Float32Array} receiver
     * @param {number=1} [scale]
     * @return {Float32Array}
     */
    Vector2.random = function ( receiver, scale ) {
      var random = _random() * 2.0 * _PI;

      scale = scale || 1.0;

      receiver[ 0 ] = _cos( random ) * scale;
      receiver[ 1 ] = _sin( random ) * scale;

      return receiver;

    };

    /**
     * @method transformMatrix2
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector
     * @param {Float32Array} matrix2
     * @return {Float32Array}
     */
    Vector2.transformMatrix2 = function ( receiver, vector, matrix2 ) {

      var
        x = vector[ 0 ],
        y = vector[ 1 ];

      receiver[ 0 ] = matrix2[ 0 ] * x + matrix2[ 2 ] * y;
      receiver[ 1 ] = matrix2[ 1 ] * x + matrix2[ 3 ] * y;

      return receiver;

    };

    /**
     * @method transformMatrix2d
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector
     * @param {Float32Array} matrix2
     * @return {Float32Array}
     */
    Vector2.transformMatrix2d = function ( receiver, vector, matrix2 ) {

      var
        x = vector[ 0 ],
        y = vector[ 1 ];

      receiver[ 0 ] = matrix2[ 0 ] * x + matrix2[ 2 ] * y + matrix2[ 4 ];
      receiver[ 1 ] = matrix2[ 1 ] * x + matrix2[ 3 ] * y + matrix2[ 5 ];

      return receiver;

    };

    /**
     * @method transformMatrix3
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector
     * @param {Float32Array} matrix2
     * @return {Float32Array}
     */
    Vector2.transformMatrix3 = function ( receiver, vector, matrix2 ) {

      var
        x = vector[ 0 ],
        y = vector[ 1 ];

      receiver[ 0 ] = matrix2[ 0 ] * x + matrix2[ 3 ] * y + matrix2[ 6 ];
      receiver[ 1 ] = matrix2[ 1 ] * x + matrix2[ 4 ] * y + matrix2[ 7 ];

      return receiver;

    };

    /**
     * @method transformMatrix4
     * @static
     * @param {Float32Array} receiver
     * @param {Float32Array} vector
     * @param {Float32Array} matrix2
     * @return {Float32Array}
     */
    Vector2.transformMatrix4 = function ( receiver, vector, matrix2 ) {

      var
        x = vector[ 0 ],
        y = vector[ 1 ];

      receiver[ 0 ] = matrix2[ 0 ] * x + matrix2[ 4 ] * y + matrix2[ 12 ];
      receiver[ 1 ] = matrix2[ 1 ] * x + matrix2[ 5 ] * y + matrix2[ 13 ];

      return receiver;

    };

    /**
     * @method forEach
     * @static
     * @return {Function}
     */
    Vector2.forEach = function () {

      var vec2 = Vector2.create();

      /**
       * @param {Array} array
       * @param {number=2} [stride]
       * @param {number=0} [offset]
       * @param {number} [count]
       * @param {function} [callback]
       * @param {Array} [args]
       */
      return function ( array, stride, offset, count, callback, args ) {

        var
          i, limit;

        stride = stride || 2;
        offset = offset || 0;

        if ( !!count ) {

          limit = _min( ( count * stride ) + offset, array.length );

        } else {

          limit = array.length;

        }

        for ( i = offset; i < limit; i = i + stride ) {

          vec2[ 0 ]  = array[ i ];
          vec2[ 1 ]  = array[ i + 1 ];
          callback && callback( vec2, vec2, args );

          array[ i ] = vec2[ 0 ];
          array[ i + 1 ] = vec2[ 1 ];

        }

        return array;

      };

    };

    return Vector2;
  }() );

}( window ) );