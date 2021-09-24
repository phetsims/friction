// Copyright 2018-2021, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
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
      targetNode: options.targetNode,
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
        const delta = dragListener.modelDelta;
        const vector = new Vector2( delta.x, delta.y );

        // instead of calling only on end drag (like for the keyboard drag listeners), increase the granularity of
        // data capture and potential alerting by triggering this evert X ms of dragging.
        if ( phet.joist.elapsedTime - lastCaptureDragStartTime > DRAG_CAPTURE_GRANULARITY ) {

          // pdom
          temperatureIncreasingAlerter.endDrag();
          bookMovementAlerter.endDrag();
        }

        model.move( vector );
      },
      end: () => {
        model.bottomOffsetProperty.set( 0 );

        // sound
        options.endSound && options.endSound.play();

        // pdom - always again on end drag
        temperatureIncreasingAlerter.endDrag();
        bookMovementAlerter.endDrag();
      },
      tandem: options.tandem
    } );
  }
}

friction.register( 'FrictionDragListener', FrictionDragListener );

export default FrictionDragListener;