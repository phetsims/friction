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

  const initialGrabbedString = FrictionA11yStrings.initialGrabbed.value;
  const grabbedLighlyOnBookString = FrictionA11yStrings.grabbedLighlyOnBook.value;
  const grabbedOnBookString = FrictionA11yStrings.grabbedOnBook.value;

  // this is a constant because we all grabButtons to use the same set of alerts. We don't want to hear the initial alert
  // once for each book view.
  const BOOK_GRABBED_UTTERANCE = new Utterance( {
    alert: [ initialGrabbedString, grabbedLighlyOnBookString ]
  } );

  /**
   * @param {BooleanProperty} contactProperty
   * @param {Node} wrappedNode
   * @param {Object} options
   * @constructor
   */
  class FrictionGrabButton extends GrabButtonNode {

    constructor( contactProperty, wrappedNode, options ) {
      super( wrappedNode, _.extend( {

        onGrab: function() {
          if ( contactProperty.get() ) {
            utteranceQueue.addToBack( grabbedOnBookString );
          }
          else {
            utteranceQueue.addToBack( BOOK_GRABBED_UTTERANCE );
          }
        }
      }, options ) );
    }

    /**
     * Reset the utterance singleton
     * @public
     */
    reset() {
      BOOK_GRABBED_UTTERANCE.reset();
    }
  }

  return friction.register( 'FrictionGrabButton', FrictionGrabButton );
} );