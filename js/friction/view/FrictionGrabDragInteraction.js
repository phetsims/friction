// Copyright 2018-2024, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book. This type serves as a central place to factor out duplicate description and voicing
 * implementations used by BookNode and MagnifyingGlassNode, both of which have almost identical interactions.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/grab-drag/GrabDragInteraction.js';
import { isVoicing } from '../../../../scenery/js/accessibility/voicing/Voicing.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';

class FrictionGrabDragInteraction extends GrabDragInteraction {

  /**
   * @param {FrictionModel} model
   * @param {KeyboardDragListener} keyboardDragListener
   * @param {Node} wrappedNode
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {function():} alertSettledAndCool
   * @param {Node} interactionCueLayer
   * @param {Object} [options]
   */
  constructor( model, keyboardDragListener, wrappedNode, grabbedDescriber, alertSettledAndCool, interactionCueLayer, options ) {

    assert && assert( isVoicing( wrappedNode ), 'wrappedNode must support voicing' );

    options = merge( {}, options );

    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;

    const grabbedUtterance = new Utterance();

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = () => {
      oldGrab && oldGrab();

      // just for pdom
      grabbedUtterance.alert = grabbedDescriber.getGrabbedString();
      wrappedNode.alertDescriptionUtterance( grabbedUtterance );

      // When using mouse/touch FrictionDragListener will cover voicing responses.
      if ( !this.isInputFromMouseOrTouch() ) {

        // No name response from PDOM, that comes from focus
        wrappedNode.voicingSpeakResponse( {
          objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse()
        } );
      }

      // alert after grabbed alert
      if ( model.vibrationAmplitudeProperty.value === model.vibrationAmplitudeProperty.initialValue ) {
        alertSettledAndCool();
      }
    };

    super( wrappedNode, keyboardDragListener, interactionCueLayer, options );

    // @private
    this.model = model;
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert( false, 'should not be disposed' );
  }
}

friction.register( 'FrictionGrabDragInteraction', FrictionGrabDragInteraction );
export default FrictionGrabDragInteraction;