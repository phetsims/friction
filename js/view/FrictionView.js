// Copyright 2002-2013, University of Colorado Boulder

/**
 * main ScreenView container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Book = require( 'FRICTION/view/book/Book' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Magnifier = require( 'FRICTION/view/magnifier/Magnifier' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // strings
  var chemistryString = require( 'string!FRICTION/chemistry' );
  var physicsString = require( 'string!FRICTION/physics' );

  /**
   * @param {FrictionModel} model
   * @constructor
   */
  function FrictionView( model ) {
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, model.width, model.height ) } );

    // add physics book
    this.addChild( new Book( model, { x: 50, y: 225, title: physicsString, color: 'rgb(0,255,51)', drag: false, cssTransform: false } ) );

    // add chemistry book
    this.addChild( new Book( model, { x: 65, y: 209, title: chemistryString, color: 'rgb(255,240,0)', drag: true, cssTransform: true } ) );

    // add magnifier
    this.addChild( this.magnifier = new Magnifier( model, { x: 40, y: 25, targetX: 195, targetY: 425, layerSplit: true } ) );

    // add thermometer
    this.addChild( new ThermometerNode( model.atoms.amplitude.min - 1.05, model.atoms.evaporationLimit * 1.1, model.amplitudeProperty,
      {
        x: 690,
        y: 250,
        tubeHeight: 160,
        tickSpacing: 9,
        lineWidth: 1,
        tubeWidth: 12,
        bulbDiameter: 24,
        majorTickLength: 4,
        minorTickLength: 4,
        fluidMainColor: 'rgb(237,28,36)',
        fluidHighlightColor: 'rgb(240,150,150)',
        fluidRightSideColor: 'rgb(237,28,36)',
        backgroundFill: 'white'
      } ) );

    // add reset button
    this.addChild( new ResetAllButton( { listener: function() { model.reset(); }, radius: 22, x: model.width * 0.94, y: model.height * 0.9 } ) );

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
