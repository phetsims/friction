// Copyright 2018-2020, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import friction from '../../friction.js';

class FrictionDragHandler extends SimpleDragHandler {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
   * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
   * @param {BookMovementDescriber} bookMovementDescriber
   * @param tandem
   * @param options
   */
  constructor( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber, bookMovementDescriber, tandem, options ) {

    options = merge( {

      // {SoundClip} - sounds to be played at start and end of drag
      startSound: null,
      endSound: null
    }, options );

    super( {
      start: () => {

        // sound
        options.startSound && options.startSound.play();

        // pdom
        temperatureIncreasingDescriber.startDrag();
        temperatureDecreasingDescriber.startDrag();
      },
      translate: e => {
        model.move( new Vector2( e.delta.x, e.delta.y ) );
      },
      end: () => {
        model.bottomOffsetProperty.set( 0 );

        // sound
        options.endSound && options.endSound.play();

        // pdom
        temperatureIncreasingDescriber.endDrag();
        bookMovementDescriber.endDrag();
      },
      tandem: tandem
    } );
  }
}

friction.register( 'FrictionDragHandler', FrictionDragHandler );

export default FrictionDragHandler;