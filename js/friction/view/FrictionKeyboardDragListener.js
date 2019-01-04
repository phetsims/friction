// Copyright 2017-2018, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const BookMovementDescriber = require( 'FRICTION/friction/view/describers/BookMovementDescriber' );
  const friction = require( 'FRICTION/friction' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardDragListener = require( 'SCENERY_PHET/accessibility/listeners/KeyboardDragListener' );
  const TemperatureDecreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureDecreasingDescriber' );
  const TemperatureIncreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureIncreasingDescriber' );
  const Vector2 = require( 'DOT/Vector2' );


  /**
   * @param {FrictionModel} model
   * @constructor
   */
  function FrictionKeyboardDragListener( model ) {

    let oldPositionValue; // determines our delta for how the positionProperty changed every drag

    KeyboardDragListener.call( this, {
      downDelta: 10,
      shiftDownDelta: 5,
      locationProperty: model.topBookPositionProperty,
      start: () => {
        oldPositionValue = model.topBookPositionProperty.get().copy();

        TemperatureIncreasingDescriber.getDescriber().startDrag();
        TemperatureDecreasingDescriber.getDescriber().startDrag();
      },
      drag: () => {
        const newValue = model.topBookPositionProperty.get();
        model.move( new Vector2( newValue.x - oldPositionValue.x, newValue.y - oldPositionValue.y ) );

        // update the oldPositionValue for the next onDrag
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },
      end: ( event ) => {
        model.bottomOffsetProperty.set( 0 );

        TemperatureIncreasingDescriber.getDescriber().endDrag();
        BookMovementDescriber.getDescriber().endDrag( event.domEvent );

      },
      dragBounds: FrictionModel.MAGNIFIED_DRAG_BOUNDS
    } );
  }

  friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

  return inherit( KeyboardDragListener, FrictionKeyboardDragListener );
} );