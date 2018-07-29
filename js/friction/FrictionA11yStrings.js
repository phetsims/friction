// Copyright 2017-2018, University of Colorado Boulder

/**
 * Single location of all accessibility strings.  These strings are not meant to be translatable yet.  Rosetta needs
 * some work to provide translators with context for these strings, and we want to receive some community feedback
 * before these strings are submitted for translation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );

  var FrictionA11yStrings = {

    bookTitleStringPattern: {
      value: '{{bookTitle}} book'
    },
    zoomedInBookTitlePattern: {
      value: 'Zoomed-in {{bookTitleString}}'
    },
    moveInFourDirections: {
      value: 'move in four directions'
    },
    bookHelpText: {
      value: 'Arrow keys, or letter keys W, A, S, or D move book up, left, down, or right.'
    },
    moveBookWith: {
      value: 'Move book up, left, down, or right with arrow keys or letter keys W, A, S, or D.'
    },
    moveSlowerWith: {
      value: 'Move slower with with shift plus arrow keys or shift plus letter keys W, A, S, or D.'
    }
  };

  // TODO: This seems it should be factored out, see https://github.com/phetsims/tasks/issues/917
  if ( phet.chipper.queryParameters.stringTest === 'xss' ) {
    for ( var key in FrictionA11yStrings ) {
      FrictionA11yStrings[ key ].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( FrictionA11yStrings ); }

  friction.register( 'FrictionA11yStrings', FrictionA11yStrings );

  return FrictionA11yStrings;
} );