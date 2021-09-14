// Copyright 2018-2021, University of Colorado Boulder

/**
 * Data structure type that keeps track of when the book has moved both left and right
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import DirectionEnum from '../../../../scenery-phet/js/accessibility/describers/DirectionEnum.js';
import friction from '../../friction.js';

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

friction.register( 'LeftRightAlertPair', LeftRightAlertPair );
export default LeftRightAlertPair;