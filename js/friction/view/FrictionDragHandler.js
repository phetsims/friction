// Copyright 2018-2019, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const inherit = require( 'PHET_CORE/inherit' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Vector2 = require( 'DOT/Vector2' );

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

    options = _.extend( {

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

  return inherit( SimpleDragHandler, FrictionDragHandler );
} );