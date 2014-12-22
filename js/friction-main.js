// Copyright 2002-2013, University of Colorado Boulder

/**
 * Main entry point for the 'Friction' sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define(
  function( require ) {
    'use strict';

    // modules
    var Bounds2 = require( 'DOT/Bounds2' );
    var Sim = require( 'JOIST/Sim' );
    var FrictionModel = require( 'FRICTION/model/FrictionModel' );
    var FrictionView = require( 'FRICTION/view/FrictionView' );
    var SimLauncher = require( 'JOIST/SimLauncher' );
    var Screen = require( 'JOIST/Screen' );

    // strings
    var simTitle = require( 'string!FRICTION/simTitle' );

    // constants
    var LAYOUT_BOUNDS = new Bounds2( 0, 0, 768, 504 );

    SimLauncher.launch( function() {

      var simOptions = {
        credits: {
          leadDesign: 'Michael Dubson, Noah Podolefsky',
          softwareDevelopment: 'Michael Dubson, John Blanco, Jonathan Olson',
          team: 'Wendy Adams, Mindy Gratny, Bryce Gruneich, Emily B. Moore, Ariel Paul,\nKatherine Perkins, Carl Wieman',
          thanks: 'Thanks to Mobile Learner Labs for working with the PhET development team\nto convert this simulation to HTML5.'
        }
      };

      //Create and start the sim
      new Sim( simTitle, [
        new Screen( simTitle, null,
          function() {return new FrictionModel( LAYOUT_BOUNDS.width, LAYOUT_BOUNDS.height );},
          function( model ) {return new FrictionView( model );},
          { backgroundColor: '#fff' }
        )
      ], simOptions ).start();
    } );
  } );