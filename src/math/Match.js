/*jslint -W016*/
( function ( window ) {

  'use strict';

  var
    document = window.document,
    Igata = window.Igata;

  Igata.Match = ( function () {

    var
      _abs = Igata._abs,
      _sqrt = Igata._sqrt;

    function Match () {

    }

    var p = Match.prototype;
    p.constructor = Match;

    Match.overall = function ( a, b, callback ) {

      var m = a[ 0 ].length === b[ 0 ].length ? a[0].length : null;
      var n = a.length === b.length ? a.length : null;
      var
        i, j;

      if ( m === null || n === null ) {

        throw new Error( 'Matrices don\'t have the same size.' );

      }

      for ( i = 0; i < m; i = (i+1)|0 ) {

        for ( j = 0; j < n; j = (j+1)|0 ) {

          callback( a[ i ][ j ], b[ i ][ j ] );

        }
      }

    };

    Match.mean = function ( a ) {

      var sum = 0;
      var m = a[ 0 ].length;
      var n = a.length;
      var
        i, j;

      for ( i = 0; i < m; i = (i+1)|0 ) {

        for ( j = 0; j < n; j = (j+1)|0 ) {

          sum += a[ i ][ j ];

        }
      }
      console.log( 'mean ', sum, m, n, sum / (m * n) );

      return sum / (m * n);

    };

    Match.sad = function ( a, b ) {

      var sum = 0;

      Match.overall( a, b, function( ca, cb ) {

        sum += _abs( ca - cb );

      });

      return sum;

    };

    Match.ssd = function ( a, b ) {

      var sum = 0;

      Match.overall( a, b, function( ca, cb ) {

        var c = ca - cb;
        sum += c * c;

      });

      return sum;

    };

    Match.zncc = function ( a, b ) {

      var mean_A = Match.mean( a );
      var mean_B = Match.mean( b );

      var numerator = 0;
      var result;
      var denumerator = 0;
      var denumerator_2 = 0;

      Match.overall( a, b, function( ca, cb ) {

        var
          caa = ca - mean_A,
          cbb = cb - mean_B;

        numerator += ( caa ) * ( cbb );
        denumerator += ( caa ) * ( caa );
        denumerator_2 += ( cbb ) * ( cbb );

      });

      result = _sqrt( denumerator * denumerator_2 );

      return numerator / result;

    };

    return Match;

  }() );

}( window ) );