// Copyright 2013-2015, University of Colorado Boulder

/**
 * Main entry point for the 'Friction' sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Sim = require( 'JOIST/Sim' );
  var FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  var FrictionView = require( 'FRICTION/friction/view/FrictionView' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Screen = require( 'JOIST/Screen' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  // strings
  var frictionTitleString = require( 'string!FRICTION/friction.title' );

  // constants
  var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

  SimLauncher.launch( function() {

    var simOptions = {
      credits: {
        leadDesign: 'Michael Dubson, Noah Podolefsky',
        softwareDevelopment: 'Michael Dubson, John Blanco, Jonathan Olson',
        team: 'Wendy Adams, Mindy Gratny, Emily B. Moore, Ariel Paul,\nKatherine Perkins, Carl Wieman',
        qualityAssurance: 'Steele Dalton, Bryce Griebenow, Ethan Johnson, Elise Morgan,\nOliver Orejola, Ben Roberts, Bryan Yoelin',
        thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team\nto convert this simulation to HTML5.'
      }
    };

    //Create and start the sim
    new Sim( frictionTitleString, [
      new Screen(
        function() {return new FrictionModel( LAYOUT_BOUNDS.width, LAYOUT_BOUNDS.height );},
        function( model ) {return new FrictionView( model );},
        { backgroundColorProperty: new Property( Color.toColor( '#fff' ) ) }
      )
    ], simOptions ).start();
  } );
} );