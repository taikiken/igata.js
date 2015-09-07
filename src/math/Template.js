///**
// * license inazumatv.com
// * author (at)taikiken / http://inazumatv.com
// * date 15/09/04 - 17:26
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
( function ( window ) {

  'use strict';

  var
    document = window.document,
    Igata = window.Igata;

  Igata.Template = ( function () {

    var
      Grayscale = Igata.Grayscale,

      _abs = Igata._abs;

    function Template () {

    }

    var p = Template.prototype;
    p.constructor = Template;

    p.match = function ( target, template, percent ) {

      var
        targetData = new Uint8ClampedArray( target.data ),
        templateData = new Uint8ClampedArray( template.data ),

        targetHeight, targetWidth,
        templateHeight, templateWidth,
        y, yEnd,
        x, xEnd,

        ty, tx,

        count,
        i, ti;

      percent = percent || 0.9;

      Grayscale.to( targetData );
      Grayscale.to( templateData );

      targetHeight = target.height;
      targetWidth = target.width;

      templateHeight = template.height;
      templateWidth = template.width;

      for ( y = 0, yEnd = targetHeight - templateHeight + 1; y < yEnd; y = (y + 1)|0 ) {

         for ( x = 0, xEnd = targetWidth - templateWidth + 1; x < xEnd; x = (x + 1)|0 ) {

           count = 0;

           for ( ty = 0; ty < templateHeight; ty = (ty + 1)|0 ) {

              for ( tx = 0; tx < templateWidth; tx = (tx + 1)|0 ) {

                ti = tx + templateWidth * ty;
                i = (x + tx) + targetWidth * ( y + ty );

                if ( targetData[ i ] === templateData[ ti ] ) {

                  count = (count+1)|0;

                }

              }

           }

         }

      }

      return templateWidth * templateHeight * percent <= count;

    };

    p.sad = function ( target, template, percent ) {

      var
        targetData = new Uint8ClampedArray( target.data ),
        templateData = new Uint8ClampedArray( template.data ),

        targetHeight, targetWidth,
        templateHeight, templateWidth,
        y, yEnd,
        x, xEnd,

        ty, tx,

        similar,
        normal,

        i, ti,
        skip,
        result,
        pixels;

      percent = percent || 0.2;

      Grayscale.to( targetData );
      Grayscale.to( templateData );

      targetHeight = target.height;
      targetWidth = target.width;

      templateHeight = template.height;
      templateWidth = template.width;

      pixels = templateWidth * templateHeight * 256;

      var start = Date.now();
      console.log( 'sad ', start );
      //skip = false;

      for ( y = 0, yEnd = targetHeight - templateHeight + 1; y < yEnd; y = (y + 1)|0 ) {

        //if ( skip ) {
        //
        //  break;
        //
        //}

         for ( x = 0, xEnd = targetWidth - templateWidth + 1; x < xEnd; x = (x + 1)|0 ) {

           similar = 0;
           normal = 0;
           skip = false;

           for ( ty = 0; ty < templateHeight; ty = (ty + 1)|0 ) {

             if ( skip ) {

               continue;

             }

              for ( tx = 0; tx < templateWidth; tx = (tx + 1)|0 ) {

                if ( skip ) {

                  continue;

                }

                ti = tx + templateWidth * ty;
                i = (x + tx) + targetWidth * ( y + ty );

                similar = similar + _abs( targetData[ i ] - templateData[ ti ] );
                normal = similar / pixels;

                if ( normal > percent ) {

                  skip = true;

                }

              }

           }

           //normal = similar / pixels;

           if ( percent >= normal ) {

             percent = normal;
             console.log( 'normal ', normal, similar, pixels );
             //skip = true;
             result = {
               normalize: normal,
               similar: similar,
               x: x,
               y: y,
               width: templateWidth,
               height: templateHeight
             };
             //break;

           }

         }

      }

      console.log( '------------------------- ', (Date.now() - start) / 1000 );

      return result;

    };

    return Template;

  }() );

}( window ) );