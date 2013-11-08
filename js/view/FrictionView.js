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

  var Book = require( 'view/Book/Book' );
  var Magnifier = require( 'view/Magnifier/Magnifier' );
  var Thermometer = require( 'view/Thermometer/Thermometer' );

  var chemistryString = require( 'string!FRICTION/chemistry' );
  var physicsString = require( 'string!FRICTION/physics' );

  function GravityAndOrbitsView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );

    // add physics book
    this.addChild( new Book( model, {x: 50, y: 225, title: physicsString, color: 'rgb(0,255,51)', drag: false} ) );

    // add chemistry book
    this.addChild( new Book( model, {x: 65, y: 210, title: chemistryString, color: 'rgb(255,240,0)', drag: true} ) );

    // add magnifier
    this.addChild( new Magnifier( model, {x: 40, y: 25, targetX: 185, targetY: 425} ) );

    // add thermometer
    this.addChild( new Thermometer( model.amplitudeProperty, {min: model.atoms.amplitude.min - 0.66, max: model.atoms.evaporationLimit - 1}, {x: 690, y: 250, height: 175, dTick: 9} ) );

    // add reset button
    this.addChild( new ResetAllButton( function() { model.reset(); }, { scale: 0.5, x: model.width * 0.94, y: model.height * 0.9} ) );

    model.init();
  }

  inherit( ScreenView, GravityAndOrbitsView );

  return GravityAndOrbitsView;
} );