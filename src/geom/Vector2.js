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
    Igata = window.Igata;

  Igata.Vector2 = ( function (){
    var
      IVector = Igata.IVector,
      Float32Array = Igata.Float32Array,
      _min = Igata._min,
      _max = Igata._max,
      _sqrt = Igata._sqrt,
      _random = Igata._random,
      _cos = Igata._cos,
      _sin = Igata._sin,
      _PI = Igata._PI;

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

      x = x || 0;
      y = y || 0;

      vec2[ 0 ] = x;
      vec2[ 1 ] = y;

      // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties
      Object.defineProperties(
        this,
        {
          "x": {
            get: function () {
              return x;
            },
            set: function ( n ) {
              x = n;
              vec2[ 0 ] = n;
            }
          },
          "y": {
            get: function () {
              return y;
            },
            set: function ( n ) {
              y = n;
              vec2[ 1 ] = y;
            }
          },
          "array": {
            get: function () {
              return vec2;
            }
          }
        }
      );
    }

    Igata.extend( IVector, Vector2 );

    var p = Vector2.prototype;

    p.constructor = Vector2;

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
     * @method leneSquare
     * @static
     * @param {Float32Array} vector1
     * @return {number}
     */
    Vector2.leneSquare = function ( vector1 ) {

      var
        x = vector1[ 0 ],
        y = vector1[ 1 ];

      return x * x + y * y;

    };

    /**
     * @method len
     * @param {Float32Array} vector1
     * @return {number}
     */
    Vector2.len = function ( vector1 ) {

      return _sqrt( Vector2.leneSquare( vector1 ) );

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
     * @param {Array} array
     * @param {function} [callback]
     * @param {number=2} [stride]
     * @param {number=0} [offset]
     * @param {number} [count]
     * @param {Array} [args]
     * @return {Array}
     */
    Vector2.forEach = function ( array, callback, stride, offset, count, args ) {
      var
        vec2 = Vector2.create(),
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
        callback && callback( vec2, args );

        array[ i ] = vec2[ 0 ];
        array[ i + 1 ] = vec2[ 1 ];

      }

      return array;

    };

    return Vector2;
  }() );

}( window ) );