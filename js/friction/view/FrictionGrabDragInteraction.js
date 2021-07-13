// Copyright 2018-2021, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';
import voicingUtteranceQueue from '../../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import friction from '../../friction.js';

/**
 * @param {FrictionModel} model
 * @param {Node} wrappedNode
 * @param {GrabbedDescriber} grabbedDescriber
 * @param {Object} [options]
 * @constructor
 */
class FrictionGrabDragInteraction extends GrabDragInteraction {

  constructor( model, keyboardDragListener, wrappedNode, grabbedDescriber, options ) {
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

      phet.joist.sim.utteranceQueue.addToBack( grabbedDescriber.getGrabbedString() );

      voicingUtteranceQueue.addToBack( grabbedDescriber.getGrabbedVoicingString() );
    };

    options.onRelease = () => {

      // there is no self-voiced "Released" string (yet), announce this manually
      // in the future this should be added to GrabDragInteraction
      voicingUtteranceQueue.addToBack( sceneryPhetStrings.a11y.grabDrag.released );
    };

    super( wrappedNode, keyboardDragListener, options );

    // @private
    this.model = model;
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