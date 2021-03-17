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
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';

// constants
const initialGrabbedNotTouchingString = frictionStrings.a11y.initialGrabbedNotTouching;
const grabbedNotTouchingString = frictionStrings.a11y.grabbedNotTouching;
const initialGrabbedTouchingString = frictionStrings.a11y.initialGrabbedTouching;
const grabbedTouchingString = frictionStrings.a11y.grabbedTouching;
const releasedString = sceneryPhetStrings.a11y.grabDrag.released;

const touchingAlerts = { initial: initialGrabbedTouchingString, subsequent: grabbedTouchingString };
const notTouchingAlerts = { initial: initialGrabbedNotTouchingString, subsequent: grabbedNotTouchingString };

/**
 * @param {FrictionModel} model
 * @param {Node} wrappedNode
 * @param {Object} [options]
 * @constructor
 */
class FrictionGrabDragInteraction extends GrabDragInteraction {

  constructor( model, keyboardDragListener, wrappedNode, options ) {
    options = merge( {

      // Function that returns whether or not the drag cue should be shown.
      showDragCueNode: () => {
        return model.topBookPositionProperty.value.equals( model.topBookPositionProperty.initialValue );
      }
    }, options );

    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = () => {
      oldGrab && oldGrab();

      // Screen reader alerts
      const alerts = model.contactProperty.get() ? touchingAlerts : notTouchingAlerts;
      let screenReaderAlert = alerts.initial;
      if ( this.successfullyInteracted ) {
        screenReaderAlert = alerts.subsequent;
      }
      phet.joist.sim.utteranceQueue.addToBack( screenReaderAlert );

      // self-voicing alerts - all self-voicing alerts exclude the "WASD" keyboard information
      phet.joist.sim.voicingUtteranceQueue && phet.joist.sim.voicingUtteranceQueue.addToBack( alerts.subsequent );
    };

    options.onRelease = () => {

      // there is no self-voiced "Released" string (yet), announce this manually
      // in the future this should be added to GrabDragInteraction
      phet.joist.sim.voicingUtteranceQueue && phet.joist.sim.voicingUtteranceQueue.addToBack( releasedString );
    };

    super( wrappedNode, keyboardDragListener, options );

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