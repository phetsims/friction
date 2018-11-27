// Copyright 2018, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const BookMovementDescriber = require( 'FRICTION/friction/view/describers/BookMovementDescriber' );
  const friction = require( 'FRICTION/friction' );
  const inherit = require( 'PHET_CORE/inherit' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const TemperatureDecreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureDecreasingDescriber' );
  const TemperatureIncreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureIncreasingDescriber' );
  const Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function FrictionDragHandler( model, tandem, options ) {

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
        TemperatureIncreasingDescriber.getDescriber().startDrag();
        TemperatureDecreasingDescriber.getDescriber().startDrag();
      },
      translate: function( e ) {
        model.move( new Vector2( e.delta.x, e.delta.y ) );
      },
      end: function() {
        model.bottomOffsetProperty.set( 0 );

        // sound
        options.endSound && options.endSound.play();

        // a11y
        TemperatureIncreasingDescriber.getDescriber().endDrag();
        BookMovementDescriber.getDescriber().endDrag();
      },
      tandem: tandem
    } );
  }

  friction.register( 'FrictionDragHandler', FrictionDragHandler );

  return inherit( SimpleDragHandler, FrictionDragHandler );
} );