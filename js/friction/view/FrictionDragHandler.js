// Copyright 2018-2020, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import SimpleDragHandler from '../../../../scenery/js/input/SimpleDragHandler.js';
import friction from '../../friction.js';

/**
 * @param {FrictionModel} model
 * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
 * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
 * @param {BookMovementDescriber} bookMovementDescriber
 * @param tandem
 * @param options
 */
function FrictionDragHandler( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber,
                              bookMovementDescriber, tandem, options ) {

  options = merge( {

    // {SoundClip} - sounds to be played at start and end of drag
    startSound: null,
    endSound: null
  }, options );

  SimpleDragHandler.call( this, {
    start: function() {

      // sound
      options.startSound && options.startSound.play();

      // a11y
      temperatureIncreasingDescriber.startDrag();
      temperatureDecreasingDescriber.startDrag();
    },
    translate: function( e ) {
      model.move( new Vector2( e.delta.x, e.delta.y ) );
    },
    end: function() {
      model.bottomOffsetProperty.set( 0 );

      // sound
      options.endSound && options.endSound.play();

      // a11y
      temperatureIncreasingDescriber.endDrag();
      bookMovementDescriber.endDrag();
    },
    tandem: tandem
  } );
}

friction.register( 'FrictionDragHandler', FrictionDragHandler );

inherit( SimpleDragHandler, FrictionDragHandler );
export default FrictionDragHandler;