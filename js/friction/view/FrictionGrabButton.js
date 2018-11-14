// Copyright 2018, University of Colorado Boulder

/**
 * A wrapping type around GrabButtonNode that handles the alerts consistently for both book grab buttons.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const GrabButtonNode = require( 'SCENERY_PHET/accessibility/nodes/GrabButtonNode' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  const initialGrabbedNotTouchingString = FrictionA11yStrings.initialGrabbedNotTouching.value;
  const grabbedNotTouchingString = FrictionA11yStrings.grabbedNotTouching.value;
  const initialGrabbedTouchingString = FrictionA11yStrings.initialGrabbedTouching.value;
  const grabbedTouchingString = FrictionA11yStrings.grabbedTouching.value;

  // this is a constant because we all grabButtons to use the same set of alerts. We don't want to hear the initial alert
  // once for each book view.

  const touchingAlerts = [ initialGrabbedTouchingString, grabbedTouchingString ];
  const notTouchingAlerts = [ initialGrabbedNotTouchingString, grabbedNotTouchingString ];

  /**
   * @param {BooleanProperty} contactProperty
   * @param {Node} wrappedNode
   * @param {Object} options
   * @constructor
   */
  class FrictionGrabButton extends GrabButtonNode {

    constructor( contactProperty, wrappedNode, options ) {

      const bookUtterance = new Utterance( {
        alert: notTouchingAlerts
      } );
      super( wrappedNode, _.extend( {

        onGrab: function() {

          // update the proper alerts according to whether we are touching or not. This will work because the
          // Utterance.numberOfTimesAlerted still won't change until reset
          if ( contactProperty.get() ) {
            bookUtterance.alert = touchingAlerts;
          }
          else {

            bookUtterance.alert = notTouchingAlerts;
          }
          utteranceQueue.addToBack( bookUtterance );
        }
      }, options ) );

      // @private
      this.bookUtterance = bookUtterance;
    }

    /**
     * Reset the utterance singleton
     * @public
     * @override
     */
    reset() {
      super.reset();
      this.bookUtterance.reset();
    }
  }

  return friction.register( 'FrictionGrabButton', FrictionGrabButton );
} );