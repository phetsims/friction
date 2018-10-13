// Copyright 2018, University of Colorado Boulder

/**
 *
 * Data structure type that keeps track of when the book has moved both left and right
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DirectionEnum = require( 'SCENERY_PHET/accessibility/describers/DirectionEnum' );
  const friction = require( 'FRICTION/friction' );

  class LeftRightAlertPair {
    constructor() {

      // @public
      this.left = false;
      this.right = false;
    }

    /**
     * @public
     */
    reset() {
      this.left = false;
      this.right = false;
    }

    /**
     * @public
     * @returns {boolean}
     */
    bothAlerted() {
      return this.left && this.right;
    }

    /**
     * Update the values of this type based on the directions moved by the book
     * @public
     * @param {DirectionEnum} direction - possible key (same as values) of DirectionEnum.
     */
    updateFromDirection( direction ) {
      if ( direction === DirectionEnum.LEFT ) {
        this.left = true;
      }
      if ( direction === DirectionEnum.RIGHT ) {
        this.right = true;
      }
    }
  }

  return friction.register( 'LeftRightAlertPair', LeftRightAlertPair );
} );