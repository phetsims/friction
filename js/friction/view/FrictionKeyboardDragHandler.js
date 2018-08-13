// Copyright 2017-2018, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const friction = require( 'FRICTION/friction' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  // const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardDragListener = require( 'SCENERY_PHET/accessibility/listeners/KeyboardDragListener' );
  const Vector2 = require( 'DOT/Vector2' );


  /**
   * @param {FrictionModel} model
   * @constructor
   */
  function FrictionKeyboardDragHandler( model ) {

    let oldPositionValue; // determines our delta for how the positionProperty changed every drag

    // see comments below about "jiggle" alerts and #189, these are temporarily removed for student testing
    // let oldAmplitude = model.amplitudeProperty.value; // keep track of the previous temperature

    KeyboardDragListener.call( this, {
      downDelta: 10,
      shiftDownDelta: 5,
      locationProperty: model.topBookPositionProperty,
      start: function() {
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },
      drag: function() {
        let newValue = model.topBookPositionProperty.get();
        model.move( new Vector2( newValue.x - oldPositionValue.x, newValue.y - oldPositionValue.y ) );
        // update the oldPositionValue for the next onDrag
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },

      // send an alert based on the drag activity
      end: function() {

        // NOTE: for now we are removing the jiggle alerts for a round of user testing because we are concerned
        // that they are too long and will interfere with the sounds. See
        // https://github.com/phetsims/friction/issues/89
        // FrictionAlertManager.alertTemperatureFromAmplitude( model.amplitudeProperty.value, oldAmplitude );
        // oldAmplitude = model.amplitudeProperty.value;

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