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
    Igata = window.Igata;

  Igata.IVector = ( function (){

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
    IVector.lenSquare  =function () {};
    IVector.len  =function () {};
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