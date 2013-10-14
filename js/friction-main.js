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
  'JOIST/SimLauncher'
], function( Sim, simTitle, FrictionModel, FrictionView, SimLauncher ) {
  'use strict';

  SimLauncher.launch( function() {

    var simOptions = {
      credits: '\n'
    };

    //Create and start the sim
    new Sim( simTitle, [
      {
        name: simTitle,
        createModel: function() {return new FrictionModel( 768, 504 );},
        createView: function( model ) {return new FrictionView( model );},
        backgroundColor: "#fff"
      }
    ], simOptions ).start();
  } );
} );