// Copyright 2013-2023, University of Colorado Boulder

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

import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import FrictionModel from './friction/model/FrictionModel.js';
import FrictionKeyboardHelpContent from './friction/view/FrictionKeyboardHelpContent.js';
import FrictionScreenView from './friction/view/FrictionScreenView.js';
import FrictionStrings from './FrictionStrings.js';

// constants
const LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

simLauncher.launch( () => {

  const simOptions = {
    credits: {
      leadDesign: 'Michael Dubson, Noah Podolefsky',
      softwareDevelopment: 'Michael Dubson, John Blanco, Jonathan Olson, Michael Kauzmann',
      team: 'Wendy Adams, Mindy Gratny, Emily B. Moore, Matthew Moore, Ariel Paul, Katherine Perkins, Taliesin Smith, Brianna Tomlinson, Carl Wieman',
      soundDesign: 'Ashton Morris, Mike Winters',
      qualityAssurance: 'Steele Dalton, Kerrie Dochen, Jaron Droder, Bryce Griebenow, Ethan Johnson, Emily Miller, Elise Morgan, ' +
                        'Liam Mulhall, Nancy Salpepi, Oliver Orejola, Ben Roberts, Bryan Yoelin, Jacob Romero, Laura Rea, Megan Lai, ' +
                        'Kathryn Woessner',
      thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team to convert this simulation to HTML5.'
    },
    phetioDesigned: true
  };

  // Create and start the sim
  const screenTandem = Tandem.ROOT.createTandem( 'frictionScreen' );
  new Sim( FrictionStrings.friction.titleStringProperty, [
    new Screen( () => new FrictionModel( LAYOUT_BOUNDS.width, LAYOUT_BOUNDS.height, screenTandem.createTandem( 'model' ) ),
      model => new FrictionScreenView( model, screenTandem.createTandem( 'view' ) ), {
        backgroundColorProperty: new Property( '#fff' ),
        tandem: screenTandem,
        createKeyboardHelpNode: () => new FrictionKeyboardHelpContent()
      }
    )
  ], simOptions ).start();
} );