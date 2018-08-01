// Copyright 2018, University of Colorado Boulder

define( function( require ) {
  'use strict';

  var friction = require( 'FRICTION/friction' );

  var TemperatureZoneEnum = {
    COOL: 'COOL',
    WARM: 'WARM',
    HOT: 'HOT',
    VERY_HOT: 'VERY_HOT',
    MORE_THAN_VERY_HOT: 'MORE_THAN_VERY_HOT' // used as an edge case when temp is above the thermometer range
  };

  /**
   * @returns {string[]} - the ordered list of temperature zones
   */
  TemperatureZoneEnum.getOrdered = function() {
    return [
      TemperatureZoneEnum.COOL,
      TemperatureZoneEnum.WARM,
      TemperatureZoneEnum.HOT,
      TemperatureZoneEnum.VERY_HOT
    ];
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( TemperatureZoneEnum ); }

  friction.register( 'TemperatureZoneEnum', TemperatureZoneEnum );

  return TemperatureZoneEnum;
} );