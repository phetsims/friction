// Copyright 2013-2018, University of Colorado Boulder

/**
 * Main entry point for the 'Friction' sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var FrictionKeyboardHelpContentPanel = require( 'FRICTION/friction/view/FrictionKeyboardHelpContentPanel' );
  var FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  var FrictionScreenView = require( 'FRICTION/friction/view/FrictionScreenView' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var frictionTitleString = require( 'string!FRICTION/friction.title' );

  // constants
  var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  SimLauncher.launch( function() {

    var keyboardHelpContent = new FrictionKeyboardHelpContentPanel();
    var simOptions = {
      credits: {
        leadDesign: 'Michael Dubson, Noah Podolefsky',
        softwareDevelopment: 'Michael Dubson, John Blanco, Jonathan Olson',
        team: 'Wendy Adams, Mindy Gratny, Emily B. Moore, Ariel Paul, Katherine Perkins, Carl Wieman',
        qualityAssurance: 'Steele Dalton, Kerrie Dochen, Bryce Griebenow, Ethan Johnson, Elise Morgan, Liam Mulhall, Oliver Orejola, Ben Roberts, Bryan Yoelin',
        thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to HTML5.'
      },
      keyboardHelpNode: keyboardHelpContent,
      accessibility: true
    };

    //Create and start the sim
    var screenTandem = Tandem.rootTandem.createTandem( 'frictionScreen' );
    new Sim( frictionTitleString, [
      new Screen( function() {return new FrictionModel( LAYOUT_BOUNDS.width, LAYOUT_BOUNDS.height, screenTandem.createTandem( 'model' ) );},
        function( model ) {return new FrictionScreenView( model, screenTandem.createTandem( 'view' ) );}, {
          backgroundColorProperty: new Property( '#fff' ),
          tandem: screenTandem
        }
      )
    ], simOptions ).start();
  } );
} );
