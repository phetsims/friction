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
  let Bounds2 = require( 'DOT/Bounds2' );
  let FrictionKeyboardHelpContentPanel = require( 'FRICTION/friction/view/FrictionKeyboardHelpContentPanel' );
  let FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  let FrictionScreenView = require( 'FRICTION/friction/view/FrictionScreenView' );
  let Property = require( 'AXON/Property' );
  let Screen = require( 'JOIST/Screen' );
  let Sim = require( 'JOIST/Sim' );
  let SimLauncher = require( 'JOIST/SimLauncher' );
  let Tandem = require( 'TANDEM/Tandem' );

  // strings
  let frictionTitleString = require( 'string!FRICTION/friction.title' );

  // constants
  let LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  SimLauncher.launch( function() {

    let keyboardHelpContent = new FrictionKeyboardHelpContentPanel();
    let simOptions = {
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

    // Create and start the sim
    let screenTandem = Tandem.rootTandem.createTandem( 'frictionScreen' );
    new Sim( frictionTitleString, [
      new Screen( function() {
          return new FrictionModel( LAYOUT_BOUNDS.width, LAYOUT_BOUNDS.height, screenTandem.createTandem( 'model' ) );
        },
        function( model ) {
          return new FrictionScreenView( model, screenTandem.createTandem( 'view' ) );
        }, {
          backgroundColorProperty: new Property( '#fff' ),
          tandem: screenTandem
        }
      )
    ], simOptions ).start();
  } );
} );
