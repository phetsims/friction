// Copyright 2018-2021, University of Colorado Boulder

/**
 * Extends the base GrabDragInteraction to supply consistent description and alternative input to all the possible ways
 * of interacting with the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GrabDragInteraction from '../../../../scenery-phet/js/accessibility/GrabDragInteraction.js';
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

    assert && assert( wrappedNode.isVoicing, 'wrappedNode must support voicing' );

    options = merge( {

      // Function that returns whether or not the drag cue should be shown.
      showDragCueNode: () => {
        return model.topBookPositionProperty.value.equals( model.topBookPositionProperty.initialValue );
      }
    }, options );

    // Keep track of the passed in grab listener, to add to it below
    const oldGrab = options.onGrab;

    // Wrap the onGrab option in default functionality for al of the type in Friction
    options.onGrab = event => {
      oldGrab && oldGrab();

      wrappedNode.alertDescriptionUtterance( grabbedDescriber.getGrabbedString() );

      if ( event.isFromPDOM() ) {

        // No name response from PDOM
        wrappedNode.voicingSpeakResponse( {
          objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse(),
          hintResponse: grabbedDescriber.getVoicingGrabbedHintResponse()
        } );
      }
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