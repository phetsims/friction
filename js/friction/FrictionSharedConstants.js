// Copyright 2013-2015, University of Colorado Boulder

/**
 * Shared constants for the 'Friction' simulation.
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );

  var FrictionSharedConstants = {
    TOP_BOOK_COLOR: 'rgb( 255, 255, 0 )',
    TOP_BOOK_ATOMS_COLOR: 'rgb( 255, 255, 0 )',
    BOTTOM_BOOK_COLOR: 'rgb( 187, 255, 187 )',
    BOTTOM_BOOK_ATOMS_COLOR: 'rgb( 0, 251, 50 )',
    ATOM_RADIUS: 7 // in screen coordinates
  };

  friction.register( 'FrictionSharedConstants', FrictionSharedConstants );

  return FrictionSharedConstants;
} );