// Copyright 2002-2013, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author John Blanco
 */
require( [
  'SCENERY/nodes/Text',
  'SCENERY/nodes/Rectangle',
  'FRICTION/Strings',
  'JOIST/Sim',
  'FRICTION/model/FrictionModel',
  'FRICTION/view/FrictionView',
  'JOIST/SimLauncher'
], function( Text, Rectangle, Strings, Sim, FrictionModel, FrictionView, SimLauncher ) {
  'use strict';

  SimLauncher.launch( function() {

    var simOptions = {
      credits: '\n'
    };

    //Create and start the sim
    new Sim( Strings['friction.name'], [
      {
        name: Strings['friction.name'],
        icon: new Rectangle( 0, 0, 50, 50, {fill: 'blue'} ),
        createModel: function() {return new FrictionModel( 768, 504 );},
        createView: function( model ) {return new FrictionView( model );},
        backgroundColor: "#9ddcf8"
      }
    ], simOptions ).start();
  } );
} );