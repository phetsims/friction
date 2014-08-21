// Copyright 2002-2013, University of Colorado Boulder

/**
 * main ScreenView container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var ScreenView = require( 'JOIST/ScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );

  var Book = require( 'FRICTION/view/Book/Book' );
  var Magnifier = require( 'FRICTION/view/magnifier/Magnifier' );
  var Thermometer = require( 'FRICTION/view/thermometer/Thermometer' );

  var chemistryString = require( 'string!FRICTION/chemistry' );
  var physicsString = require( 'string!FRICTION/physics' );

  function FrictionView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );

    // add physics book
    this.addChild( new Book( model, {x: 50, y: 225, title: physicsString, color: 'rgb(0,255,51)', drag: false, cssTransform: false } ) );

    // add chemistry book
    this.addChild( new Book( model, {x: 65, y: 209, title: chemistryString, color: 'rgb(255,240,0)', drag: true, cssTransform: true } ) );

    // add magnifier
    this.addChild( this.magnifier = new Magnifier( model, {x: 40, y: 25, targetX: 200, targetY: 425, layerSplit: true } ) );

    // add thermometer
    this.addChild( new Thermometer( model.amplitudeProperty, {min: model.atoms.amplitude.min - 1.05, max: model.atoms.evaporationLimit * 1.1 }, {x: 690, y: 250, height: 175, dTick: 9} ) );

    // add reset button
    this.addChild( new ResetAllButton( { listener: function() { model.reset(); }, radius: 22, x: model.width * 0.94, y: model.height * 0.9} ) );

    model.init();
  }

  return inherit( ScreenView, FrictionView, {
    step: function( timeElapsed ) {
      this.magnifier.step( timeElapsed );
    },

    layout: function( width, height ) {
      ScreenView.prototype.layout.call( this, width, height );

      this.magnifier.layout();
    }
  } );
} );
