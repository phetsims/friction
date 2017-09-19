// Copyright 2017, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the Book and the Magnifier atoms.
 * @author - Michael Kauzmann (PhET Interactive Simulations)
 */

define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );
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
        oldValue = model.positionProperty.get();
      },
      onDrag: function() {
        var newValue = model.positionProperty.get();
        model.move( { x: newValue.x - oldValue.x, y: newValue.y - oldValue.y } );

        // update the oldValue for the next onDrag
        oldValue = model.positionProperty.get();
      }
    } );
  }

  friction.register( 'FrictionKeyboardDragHandler', FrictionKeyboardDragHandler );

  return inherit( KeyboardDragHandler, FrictionKeyboardDragHandler );
} );