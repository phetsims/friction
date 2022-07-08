// Copyright 2018-2022, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { DragListener } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import friction from '../../friction.js';

const DRAG_CAPTURE_GRANULARITY = 3000; // in ms

class FrictionDragListener extends DragListener {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param options
   */
  constructor( model, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter, options ) {

    options = merge( {

      // {SoundClip} - sounds to be played at start and end of drag
      startSound: null,
      endSound: null,
      targetNode: null,

      startDrag: _.noop,

      tandem: Tandem.REQUIRED
    }, options );

    let lastCaptureDragStartTime = 0;

    super( {
      positionProperty: model.topBookPositionProperty,
      dragBoundsProperty: model.topBookDragBoundsProperty,
      targetNode: options.targetNode,

      // This allows the bounds and transform to be in the correct coordinate frame even though we provide a targetNode
      useParentOffset: true,

      start: () => {

        lastCaptureDragStartTime = phet.joist.elapsedTime;

        // sound
        options.startSound && options.startSound.play();

        // pdom
        temperatureIncreasingAlerter.startDrag();
        temperatureDecreasingAlerter.startDrag();

        options.startDrag();
      },
      drag: ( event, dragListener ) => {

        // instead of calling only on end drag (like for the keyboard drag listeners), increase the granularity of
        // data capture and potential alerting by triggering this every X ms of dragging.
        if ( phet.joist.elapsedTime - lastCaptureDragStartTime > DRAG_CAPTURE_GRANULARITY ) {

          // pdom
          temperatureIncreasingAlerter.onDrag();
          bookMovementAlerter.endDrag();
        }
      },
      end: () => {

        // sound
        options.endSound && options.endSound.play();

        // pdom - always again on end drag
        temperatureIncreasingAlerter.endDrag();
        temperatureDecreasingAlerter.endDrag();
        bookMovementAlerter.endDrag();
      },
      tandem: options.tandem
    } );
  }
}

friction.register( 'FrictionDragListener', FrictionDragListener );

export default FrictionDragListener;