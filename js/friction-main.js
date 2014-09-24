// Copyright 2002-2013, University of Colorado Boulder

/**
 * Main entry point for the 'Friction' sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define(
  function( require ) {
    'use strict';

    var
      Sim = require( 'JOIST/Sim' ),
      simTitle = require( 'string!FRICTION/simTitle' ),
      FrictionModel = require( 'FRICTION/model/FrictionModel' ),
      FrictionView = require( 'FRICTION/view/FrictionView' ),
      SimLauncher = require( 'JOIST/SimLauncher' ),
      Screen = require( 'JOIST/Screen' ),
      ScreenView = require( 'JOIST/ScreenView' );

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
          function() {return new FrictionModel( ScreenView.DEFAULT_LAYOUT_BOUNDS.width, ScreenView.DEFAULT_LAYOUT_BOUNDS.height );},
          function( model ) {return new FrictionView( model );},
          { backgroundColor: '#fff' }
        )
      ], simOptions ).start();
    } );
  } );