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
  const Bounds2 = require( 'DOT/Bounds2' );
  const FrictionKeyboardHelpContent = require( 'FRICTION/friction/view/FrictionKeyboardHelpContent' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const FrictionScreenView = require( 'FRICTION/friction/view/FrictionScreenView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const frictionTitleString = require( 'string!FRICTION/friction.title' );

  // constants
  const LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  SimLauncher.launch( function() {

    const keyboardHelpContent = new FrictionKeyboardHelpContent();
    const simOptions = {
      credits: {
        leadDesign: 'Michael Dubson, Noah Podolefsky',
        softwareDevelopment: 'Michael Dubson, John Blanco, Jonathan Olson, Michael Kauzmann',
        team: 'Wendy Adams, Mindy Gratny, Emily B. Moore, Ariel Paul, Katherine Perkins, Taliesin Smith, Brianna Tomlinson, Carl Wieman',
        soundDesign: 'Ashton Morris, Mike Winters',
        qualityAssurance: 'Steele Dalton, Kerrie Dochen, Bryce Griebenow, Ethan Johnson, Elise Morgan, Liam Mulhall, ' +
                          'Oliver Orejola, Ben Roberts, Bryan Yoelin, Jacob Romero, Laura Rea, Megan Lai, ' +
                          'Kathryn Woessner',
        thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to HTML5.'
      },
      keyboardHelpNode: keyboardHelpContent,
      accessibility: true,
      supportsEnhancedSound: true,
      supportsSound: true
    };

    // Create and start the sim
    const screenTandem = Tandem.rootTandem.createTandem( 'frictionScreen' );
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
