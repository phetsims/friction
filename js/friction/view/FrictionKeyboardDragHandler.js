// Copyright 2017, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the Book and the Magnifier atoms.
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var friction = require( 'FRICTION/friction' );
  var FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KeyboardDragHandler = require( 'SCENERY_PHET/accessibility/KeyboardDragHandler' );

  /**
   * @constructor
   * @param {FrictionModel} model
   */
  function FrictionKeyboardDragHandler( model ) {

    var oldValue; // determines our delta for how the positionProperty changed every drag

    KeyboardDragHandler.call( this, model.positionProperty, {
      positionDelta: 10,
      shiftKeyMultiplier: .5,
      startDrag: function() {
        oldValue = model.positionProperty.get().copy();
      },
      onDrag: function() {
        var newValue = model.positionProperty.get();
        model.move( { x: newValue.x - oldValue.x, y: newValue.y - oldValue.y } );

        // update the oldValue for the next onDrag
        oldValue = model.positionProperty.get().copy();
      },
      dragBounds: new Bounds2(
        -FrictionModel.MAX_X_DISPLACEMENT, // left bound
        FrictionModel.MIN_Y_POSITION, // top bound
        FrictionModel.MAX_X_DISPLACEMENT, // right bound
        2000 ) // bottom bound, arbitrary because the model stops the motion when the top atoms collide with the bottom book
    } );
  }

  friction.register( 'FrictionKeyboardDragHandler', FrictionKeyboardDragHandler );

  return inherit( KeyboardDragHandler, FrictionKeyboardDragHandler );
} );