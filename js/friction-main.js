// Copyright 2002-2013, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
require( [
  'JOIST/Sim',
  'string!FRICTION/simTitle',
  'FRICTION/model/FrictionModel',
  'FRICTION/view/FrictionView',
  'JOIST/SimLauncher',
  'JOIST/Screen'
], function( Sim, simTitle, FrictionModel, FrictionView, SimLauncher, Screen ) {
  'use strict';

  SimLauncher.launch( function() {

    var simOptions = {
      credits: {
        //TODO
      }
    };

    //Create and start the sim
    new Sim( simTitle, [
      new Screen( simTitle, null,
        function() {return new FrictionModel( 768, 504 );},
        function( model ) {return new FrictionView( model );},
        { backgroundColor: '#fff' }
      )
    ], simOptions ).start();
  } );
} );