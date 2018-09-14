// Copyright 2018, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Michael Kauzmann (PhET Interactive Simultations)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );

  var FrictionQueryParameters = QueryStringMachine.getAll( {

    // decreasing alert parameters

    // The amount of amplitude that the model must decrease from the last point where it was increasing. This value
    // is to help with minor fluctuations as the model "cools" itself every step even while friction is generally increasing.
    // in same units as FrictionModel's amplitude
    amplitudeDecreasingThreshold: { type: 'number', defaultValue: 1 },

    // How long in between each subsequent decreasing alert
    // in ms
    coolingAlertTimeDelay: { type: 'number', defaultValue: 3000 },


    // warming alert parameters

    // How long in between each subsequent warming alert
    // in ms
    warmingAlertTimeDelay: { type: 'number', defaultValue: 500 },

    // how long to wait until we consider this newest drag of a different "drag session", such
    // that the warming alert progression will start over back at "warmer" alerts.
    // in ms
    dragSessionThreshold: { type: 'number', defaultValue: 1000 },


    // break away parameters

    // How long in between each subsequent break away alert
    // in ms
    breakAwayAlertTimeDelay: { type: 'number', defaultValue: 2000 }

  } );

  friction.register( 'FrictionQueryParameters', FrictionQueryParameters );

  return FrictionQueryParameters;
} );
