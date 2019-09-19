// Copyright 2017-2019, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardDragListener = require( 'SCENERY/listeners/KeyboardDragListener' );
  const Vector2 = require( 'DOT/Vector2' );


  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
   * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
   * @param {BookMovementDescriber} bookMovementDescriber
   * @constructor
   */
  function FrictionKeyboardDragListener( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber,
                                         bookMovementDescriber ) {

    let oldPositionValue; // determines our delta for how the positionProperty changed every drag

    KeyboardDragListener.call( this, {
      locationProperty: model.topBookPositionProperty,
      start: () => {
        oldPositionValue = model.topBookPositionProperty.get().copy();

        temperatureIncreasingDescriber.startDrag();
        temperatureDecreasingDescriber.startDrag();
      },
      drag: () => {
        const newValue = model.topBookPositionProperty.get();
        model.move( new Vector2( newValue.x - oldPositionValue.x, newValue.y - oldPositionValue.y ) );

        // update the oldPositionValue for the next onDrag
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },
      end: event => {
        model.bottomOffsetProperty.set( 0 );

        temperatureIncreasingDescriber.endDrag();
        bookMovementDescriber.endDrag( event.domEvent );

      },
      dragBounds: FrictionModel.MAGNIFIED_DRAG_BOUNDS
    } );
  }

  friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

  return inherit( KeyboardDragListener, FrictionKeyboardDragListener );
} );