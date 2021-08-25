// Copyright 2018-2021, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import friction from '../../friction.js';

class FrictionDragListener extends DragListener {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
   * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param tandem
   * @param options
   */
  constructor( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber, bookMovementAlerter, tandem, options ) {

    options = merge( {

      // {SoundClip} - sounds to be played at start and end of drag
      startSound: null,
      endSound: null,
      targetNode: null,

      startDrag: _.noop
    }, options );

    super( {
      targetNode: options.targetNode,
      start: () => {

        // sound
        options.startSound && options.startSound.play();

        // pdom
        temperatureIncreasingDescriber.startDrag();
        temperatureDecreasingDescriber.startDrag();

        options.startDrag();
      },
      drag: ( event, dragListener ) => {
        const delta = dragListener.modelDelta;
        const vector = new Vector2( delta.x, delta.y );

        model.move( vector );
      },
      end: () => {
        model.bottomOffsetProperty.set( 0 );

        // sound
        options.endSound && options.endSound.play();

        // pdom
        temperatureIncreasingDescriber.endDrag();
        bookMovementAlerter.endDrag();
      },
      tandem: tandem
    } );
  }
}

friction.register( 'FrictionDragListener', FrictionDragListener );

export default FrictionDragListener;