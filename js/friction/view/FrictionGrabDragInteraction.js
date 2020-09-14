// Copyright 2018-2020, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const initialGrabbedNotTouchingString = frictionStrings.a11y.initialGrabbedNotTouching;
const grabbedNotTouchingString = frictionStrings.a11y.grabbedNotTouching;
const initialGrabbedTouchingString = frictionStrings.a11y.initialGrabbedTouching;
const grabbedTouchingString = frictionStrings.a11y.grabbedTouching;

const touchingAlerts = { initial: initialGrabbedTouchingString, subsequent: grabbedTouchingString };
const notTouchingAlerts = { initial: initialGrabbedNotTouchingString, subsequent: grabbedNotTouchingString };

/**
 * @param {FrictionModel} model
 * @param {Node} wrappedNode
 * @param {Object} [options]
 * @constructor
 */
class FrictionGrabDragInteraction extends GrabDragInteraction {

  constructor( model, wrappedNode, options ) {
    options = merge( {

      // Function that returns whether or not the drag cue should be shown.
      successfulDrag: () => {
        return !model.topBookPositionProperty.value.equals( model.topBookPositionProperty.initialValue );
      }
    }, options );

    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = () => {
      oldGrab && oldGrab();

      const alerts = model.contactProperty.get() ? touchingAlerts : notTouchingAlerts;

      let alert = alerts.initial;
      if ( this.successfullyInteracted ) {
        alert = alerts.subsequent;
      }
      phet.joist.sim.utteranceQueue.addToBack( alert );
    };

    super( wrappedNode, options );

    // @private
    this.successfullyInteracted = false; // Keep track when an interaction has successfully occurred.
    this.model = model;
    this.amplitudeListener = amplitude => {
      if ( !this.successfullyInteracted && amplitude > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
        this.successfullyInteracted = true;
      }
    };
    model.vibrationAmplitudeProperty.link( this.amplitudeListener );
  }

  /**
   * Reset the utterance singleton
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.successfullyInteracted = false;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.model.vibrationAmplitudeProperty.unlink( this.amplitudeListener );
  }
}

friction.register( 'FrictionGrabDragInteraction', FrictionGrabDragInteraction );
export default FrictionGrabDragInteraction;