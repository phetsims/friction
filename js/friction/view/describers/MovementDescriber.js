// Copyright 2018, University of Colorado Boulder

/**
 * A generic accessibility  type that will alert positional alerts based on a locationProperty and a Bounds2 encapsulating the draggable area.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const friction = require( 'FRICTION/friction' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  /**
   *
   * @param {Object} [options]
   * @constructor
   */
  class MovementDescriber {
    constructor( locationProperty, options ) {

      options = _.extend( {

        // {Bounds2}
        bounds: new Bounds2( Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY ),

        // {Object.<{direction},{string}>} - left, right, top, with values to alert if you reach that bound
        borderAlerts: {
          left: 'At left edge',
          right: 'At right edge',
          top: 'At top'
        }

      }, options );

      this.bounds = options.bounds;

      locationProperty.link( ( newValue, oldValue ) => {

        // independent if statements for now

        // at left now, but wasn't last location
        if ( newValue.x === this.bounds.getLeft() && oldValue.x !== this.bounds.getLeft() ) {
          utteranceQueue.addToBack( options.borderAlerts.left );
        }

        // at right now, but wasn't last location
        if ( newValue.x === this.bounds.getRight() && oldValue.x !== this.bounds.getRight() ) {
          utteranceQueue.addToBack( options.borderAlerts.right );
        }

        // at top now, but wasn't last location
        if ( newValue.y === this.bounds.getTop() && oldValue.y !== this.bounds.getTop() ) {
          console.log( 'newValue = ' + newValue );
          console.log( 'oldValue = ' + oldValue );
          utteranceQueue.addToBack( options.borderAlerts.top );
        }

      } );
    }

    reset() {
      // resetting will be needed
    }
  }

  return friction.register( 'MovementDescriber', MovementDescriber );
} );