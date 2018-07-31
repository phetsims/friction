// Copyright 2017-2018, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  let Bounds2 = require( 'DOT/Bounds2' );
  let friction = require( 'FRICTION/friction' );
  let FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  let inherit = require( 'PHET_CORE/inherit' );
  let KeyboardDragListener = require( 'SCENERY_PHET/accessibility/listeners/KeyboardDragListener' );
  let Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {FrictionModel} model
   * @constructor
   */
  function FrictionKeyboardDragHandler( model ) {

    let oldValue; // determines our delta for how the positionProperty changed every drag

    KeyboardDragListener.call( this, {
      downDelta: 10,
      shiftDownDelta: 5,
      locationProperty: model.topBookPositionProperty,
      start: function() {
        oldValue = model.topBookPositionProperty.get().copy();
      },
      drag: function() {
        let newValue = model.topBookPositionProperty.get();
        model.move( new Vector2( newValue.x - oldValue.x, newValue.y - oldValue.y ) );

        // update the oldValue for the next onDrag
        oldValue = model.topBookPositionProperty.get().copy();
      },
      dragBounds: new Bounds2(
        -FrictionModel.MAX_X_DISPLACEMENT, // left bound
        FrictionModel.MIN_Y_POSITION, // top bound
        FrictionModel.MAX_X_DISPLACEMENT, // right bound
        2000 ) // bottom, arbitrary because the model stops the motion when the top atoms collide with the bottom book
    } );
  }

  friction.register( 'FrictionKeyboardDragHandler', FrictionKeyboardDragHandler );

  return inherit( KeyboardDragListener, FrictionKeyboardDragHandler );
} );