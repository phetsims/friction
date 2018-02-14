// Copyright 2013-2018, University of Colorado Boulder

/**
 * Friction's ScreenView
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BookNode = require( 'FRICTION/friction/view/book/BookNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MagnifierNode = require( 'FRICTION/friction/view/magnifier/MagnifierNode' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // strings
  var chemistryString = require( 'string!FRICTION/chemistry' );
  var physicsString = require( 'string!FRICTION/physics' );

  // constants
  var THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
  var THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
  var THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
  var THERMOMETER_BACKGROUND_FILL_COLOR = 'white';

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @constructor
   */
  function FrictionScreenView( model, tandem ) {
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, model.width, model.height ) } );

    // add physics book
    this.addChild( new BookNode( model, physicsString, {
      x: 50,
      y: 225,
      tandem: tandem.createTandem( 'physicsBookNode' )
    } ) );

    // @private - add chemistry book
    this.draggableBook = new BookNode( model, chemistryString, {
      x: 65,
      y: 209,
      color: FrictionConstants.TOP_BOOK_COLOR_MACRO,
      drag: true,
      tandem: tandem.createTandem( 'chemistryBookNode' )
    } );
    this.addChild( this.draggableBook );

    // add magnifier
    this.magnifierNode = new MagnifierNode( model, 195, 425, chemistryString, {
      x: 40,
      y: 25,
      layerSplit: true,
      tandem: tandem.createTandem( 'magnifierNode' )
    } );
    this.addChild( this.magnifierNode );

    // add thermometer
    this.addChild( new ThermometerNode( model.atoms.amplitude.min - 1.05, model.atoms.evaporationLimit * 1.1, model.amplitudeProperty, {
      x: 690,
      y: 250,
      tubeHeight: 160,
      tickSpacing: 9,
      lineWidth: 1,
      tubeWidth: 12,
      bulbDiameter: 24,
      majorTickLength: 4,
      minorTickLength: 4,
      fluidMainColor: THERMOMETER_FLUID_MAIN_COLOR,
      fluidHighlightColor: THERMOMETER_FLUID_HIGHLIGHT_COLOR,
      fluidRightSideColor: THERMOMETER_FLUID_RIGHT_SIDE_COLOR,
      backgroundFill: THERMOMETER_BACKGROUND_FILL_COLOR
    } ) );

    // add reset button
    this.addChild( new ResetAllButton( {
      listener: function() { model.reset(); },
      radius: 22,
      x: model.width * 0.94,
      y: model.height * 0.9,
      touchAreaDilation: 12,
      tandem: tandem.createTandem( 'resetAllButton' )
    } ) );

    // Initialize the model now that MagnifierNode has added the toEvaporateSample AtomNodes
    model.init();
  }

  friction.register( 'FrictionScreenView', FrictionScreenView );

  return inherit( ScreenView, FrictionScreenView, {

    /**
     * Move forward in time
     * @param {number} dt - seconds
     * @public
     */
    step: function( dt ) {
      this.magnifierNode.step( dt );
    }
  } );
} );
