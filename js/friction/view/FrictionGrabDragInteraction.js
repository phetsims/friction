// Copyright 2018-2021, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book. This type serves as a central place to factor out duplicate description and voicing
 * implementations used by BookNode and MagnifierNode, both of which have almost identical interactions.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';

class FrictionGrabDragInteraction extends GrabDragInteraction {

  /**
   * @param {FrictionModel} model
   * @param {KeyboardDragListener} keyboardDragListener
   * @param {Node} wrappedNode
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {function():} alertSettledAndCool
   * @param {Object} [options]
   */
  constructor( model, keyboardDragListener, wrappedNode, grabbedDescriber, alertSettledAndCool, options ) {

    assert && assert( wrappedNode.isVoicing, 'wrappedNode must support voicing' );

    options = merge( {

      // Function that returns whether or not the drag cue should be shown.
      showDragCueNode: () => {
        return model.topBookPositionProperty.value.equals( model.topBookPositionProperty.initialValue );
      },

      // appended to in this type
      listenersForDragState: []
    }, options );


    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;

    const grabbedUtterance = new Utterance();

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = event => {
      oldGrab && oldGrab();

      grabbedUtterance.alert = grabbedDescriber.getGrabbedString();
      wrappedNode.alertDescriptionUtterance( grabbedUtterance );

      // When using mouse/touch FrictionDragListener will cover voicing responses.
      if ( event.isFromPDOM() ) {

        // No name response from PDOM, that comes from focus
        wrappedNode.voicingSpeakResponse( {
          objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse(),
          hintResponse: grabbedDescriber.getVoicingGrabbedHintResponse()
          // TODO: when there is no "Lightly on Physics book", the punctuation is wrong, will we need a different ResponsePatternCollection?
        } );
      }
    };

    options.listenersForDragState.push( {

      // alert the temperature state on focus, TODO: this is called right now, but immediately interrupted by grabbed alerts.
      focus: () => {
        if ( model.vibrationAmplitudeProperty.value === model.vibrationAmplitudeProperty.initialValue ) {
          alertSettledAndCool();
        }
      }
    } );

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