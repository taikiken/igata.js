///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/12
// *
// * Copyright (c) 2011-2015 inazumatv.com, inc.
// *
// * Distributed under the terms of the MIT license.
// * http://www.opensource.org/licenses/mit-license.html
// *
// * This notice shall be included in all copies or substantial portions of the Software.
// */
/**
 * Vector(x,y,z) Helper
 *
 * @module Igata
 */
(function ( window ){

  'use strict';

  var
    Igata = window.Igata,
    global = Igata;

  global.Vector3 = ( function (){

    var
      _sqrt = global._sqrt;

    /**
     * @class Vector3
     *
     * @param {number=0} [x]
     * @param {number=0} [y]
     * @param {number=0} [z]
     * @constructor
     */
    function Vector3 ( x, y, z ) {

      x = x || 0;
      y = y || 0;
      z = z || 0;

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
       * @property z
       * @type {number}
       */
      this.z = z;

    }

    var p = Vector3.prototype;
    p.constructor = Vector3;

    /**
     * clone を作成します
     * @method clone
     * @return {Vector3} clone Vector3 instance を返します
     */
    p.clone = function () {

      return new Vector3( this.x, this.y, this.z );

    };

    /**
     * x, y, z を 0 に設定します
     *
     * @method zero
     * @return {Vector3}
     */
    p.zero = function () {

      this.x = 0;
      this.y = 0;
      this.z = 0;

      return this;

    };
    /**
     * vector との 加算・除算 を行います
     * @method add
     * @param {Vector3} vector
     * @return {Vector3}
     */
    p.add = function ( vector ) {

      this.x += vector.x;
      this.y += vector.y;
      this.z += vector.z;

      return this;

    };
    /**
     * scalar との 加算・除算 を行います
     * @method addS
     * @param {number} scalar
     * @return {Vector3}
     */
    p.addS = function ( scalar ) {

      this.x += scalar;
      this.y += scalar;
      this.z += scalar;

      return this;

    };
    /**
     * vector との乗算を行います
     * @method multiply
     * @param vector
     * @return {Vector3}
     */
    p.multiply = function ( vector ) {

      this.x *= vector.x;
      this.y *= vector.y;
      this.z *= vector.z;

      return this;

    };
    /**
     * scalar との乗算を行います
     * @method multiplyS
     * @param {number} scalar
     * @return {Vector3}
     */
    p.multiplyS = function ( scalar ) {

      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;

      return this;

    };

    /**
     * vector との除法を行います
     * @method division
     * @param {Vector3} vector
     * @return {Vector3}
     */
    p.division = function ( vector ) {

      this.x /= vector.x;
      this.y /= vector.y;
      this.z /= vector.z;

      return this;

    };

    /**
     * scalar との除法を行います
     * @method divisionS
     * @param {number} scalar
     * @return {Vector3}
     */
    p.divisionS = function ( scalar ) {

      return this.multiplyS( 1.0 / scalar );

    };

    /**
     * 正規化 (0 ~ 1) を行います
     * @method normalize
     * @return {{x: number, y: number, z: number}} 正規化後の値を構造体で返します
     */
    p.normalize = function () {

      return Vector3.normalize( this );

    };

    /**
     * 内積を計算します
     *
     * @method product
     * @param {Vector3} vector
     * @return {number}
     */
    p.product = function ( vector ) {

      return this.x*vector.x + this.y*vector.y + this.z*vector.z;

    };

    /**
     * ベクトルの大きさを計算します
     *
     * @method magnitude
     * @return {number} ベクトルの大きさを返します
     */
    p.magnitude = function () {

      return Vector3.magnitude( this );

    };

    /**
     * 外積（クロス積）を計算します
     *
     * @method cross
     * @param {Vector3} vector
     * @return {Vector3}
     */
    p.cross = function ( vector ) {

      return Vector3.cross( this, vector );

    };

    /**
     * 距離を計算します
     * @method distance
     * @param {Vector3} vector
     * @return {number} 距離を返します
     */
    p.distance = function ( vector ) {

      return Vector3.distance( this, vector );

    };

    // ------------------------------------------------------------------
    // static
    // ------------------------------------------------------------------
    /**
     * vector との 加算・除算 を行います
     * @method add
     * @static
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    Vector3.add = function ( a, b ) {

      return new Vector3( a.x+ b.x, a.y+ b.y, a.z+ b.z );

    };
    /**
     * scalar との 加算・除算 を行います
     * @method addS
     * @static
     * @param {Vector3} a
     * @param {number} scalar
     * @return {Vector3}
     */
    Vector3.addS = function ( a, scalar ) {

      return new Vector3( a.x+ scalar, a.y+ scalar, a.z+ scalar );

    };
    /**
     * vector との乗算を行います
     * @method multiply
     * @static
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    Vector3.multiply = function ( a, b ) {

      return new Vector3( a.x*b.x, a.y*b.y, a.z*b.z );

    };
    /**
     * scalar との乗算を行います
     * @method multiplyS
     * @static
     * @param {Vector3} a
     * @param {number} scalar
     * @return {Vector3}
     */
    Vector3.multiplyS = function ( a, scalar ) {

      return new Vector3( a.x* scalar, a.y* scalar, a.z* scalar );

    };
    /**
     * vector との除法を行います
     * @method division
     * @static
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    Vector3.division = function ( a, b ) {

      return new Vector3( a.x/b.x, a.y/b.y, a.z/b.z );

    };

    /**
     * scalar との除法を行います
     * @method divisionS
     * @static
     * @param {Vector3} a
     * @param {number} scalar
     * @return {Vector3}
     */
    Vector3.divisionS = function ( a, scalar ) {

      return new Vector3( a.x/scalar, a.y/scalar, a.z/scalar );

    };

    /**
     * 引数 vector のベクトルの大きさを計算します
     *
     * @method magnitude
     * @static
     * @param {Vector3} vector
     * @return {number} ベクトルの大きさを返します
     */
    Vector3.magnitude = function ( vector ) {

      var
        x = vector.x,
        y = vector.y,
        z = vector.z;

      return _sqrt( x*x + y*y + z*z );

    };

    /**
     * 2つの vector 内積を計算します
     *
     * @method product
     * @static
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {number}
     */
    Vector3.product = function ( a, b ) {

      return a.x*b.x + a.y*b.y + a.z*b.z;

    };


    /**
     * 2つの vector の外積（クロス積）を計算します
     *
     * @method cross
     * @static
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    Vector3.cross = function ( a, b ) {

      return new Vector3(
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
      );

    };

    /**
     * 2つの vector 間の距離を計算します
     *
     * @method distance
     * @static
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {number} 距離を返します
     */
    Vector3.distance = function ( a, b ) {

      var
        dx = a.x - b.x,
        dy = a.y - b.y,
        dz = a.z - b.z;

      return _sqrt( dx*dx + dy*dy + dz*dz );

    };

    /**
     * 正規化 (0 ~ 1) を行います
     *
     * @method normalize
     * @static
     * @param {Vector3} vector
     * @return {{x: number, y: number, z: number}} 正規化後の値を構造体で返します
     */
    Vector3.normalize = function ( vector ) {

      var
        x = vector.x,
        y = vector.y,
        z = vector.z,

        xyz = x*x + y*y + z*z,
        results = {
          x: 0,
          y: 0,
          z: 0
        },
        one;

      // xyz は必ず正
      // 0 check
      if ( xyz > 0 ) {

        one = 1.0 / _sqrt( xyz );
        results.x = x * one;
        results.y = y * one;
        results.z = z * one;

      }

      return results;

    };

    return Vector3;

  }());

}( window ));