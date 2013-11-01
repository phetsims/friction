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
          //TODO
        }
      };

      //Create and start the sim
      new Sim( simTitle, [
        new Screen( simTitle, null,
          function() {return new FrictionModel( ScreenView.LAYOUT_BOUNDS.width, ScreenView.LAYOUT_BOUNDS.height );},
          function( model ) {return new FrictionView( model );},
          { backgroundColor: '#fff' }
        )
      ], simOptions ).start();
    } );
  } );