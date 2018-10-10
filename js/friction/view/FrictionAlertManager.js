// Copyright 2018, University of Colorado Boulder

/**
 * Manager for the alerts that are dynamically emitted in the simulation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemperatureZoneEnum = require( 'FRICTION/friction/model/TemperatureZoneEnum' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );

  // a11y strings
  const frictionIncreasingAtomsJigglingTemperatureFirstPatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperatureFirstPattern.value;
  const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperaturePattern.value;
  const atomsJiggleTinyBitTempCoolString = FrictionA11yStrings.atomsJiggleTinyBitTempCool.value;

  // constants
  //TODO duplicated min/max constants with the screen view
  const THERMOMETER_MIN_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
  const THERMOMETER_MAX_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1; // 7.7???

  const THERMOMETER_RANGE = THERMOMETER_MAX_TEMP - THERMOMETER_MIN_TEMP;
  const DIVIDED_RANGE = THERMOMETER_RANGE / 9;

  // a11y - [cool, warm, hot, very hot]
  const AMPLITUDE_RANGES = [ new Range( THERMOMETER_MIN_TEMP, 2 * DIVIDED_RANGE ),
    new Range( 2 * DIVIDED_RANGE, 5 * DIVIDED_RANGE ),
    new Range( 5 * DIVIDED_RANGE, 8 * DIVIDED_RANGE ),
    new Range( 8 * DIVIDED_RANGE, 9 * DIVIDED_RANGE )
  ];
  const TEMPERATURE_ZONES = TemperatureZoneEnum.getOrdered();

  // sanity check to keep these in sync
  assert && assert( AMPLITUDE_RANGES.length === TEMPERATURE_ZONES.length );

  var FrictionAlertManager = {

    /**
     * @param {object} alertObject - data object holding strings for alert, see this.ALERT_SCHEMA
     * @param {boolean} firstTimeAlerting - if it is the first time alerting this alert, there could be a special case in the data object
     * @param {string} [typeID]
     * @public
     */
    alertTemperatureJiggleFromObject: function( alertObject, firstTimeAlerting, typeID ) {

      let patternString = frictionIncreasingAtomsJigglingTemperaturePatternString;

      // Use the "first time" pattern string if it is the first time. Gracefully handle if there isn't a first time alert
      if ( alertObject.firstTime && firstTimeAlerting ) {
        patternString = frictionIncreasingAtomsJigglingTemperatureFirstPatternString;

        // use the fill in values for the first time
        alertObject = alertObject.firstTime;
      }

      var string = StringUtils.fillIn( patternString, {
        temperature: alertObject.temp,
        jigglingAmount: alertObject.jiggle
      } );

      utteranceQueue.addToBack( new Utterance( string, { uniqueGroupId: typeID } ) );
    },

    /**
     * Alert the state of the cool and settled atoms.
     * @public
     */
    alertSettledAndCool: function() {
      utteranceQueue.addToBack( atomsJiggleTinyBitTempCoolString );
    },

    // Threshold that must be reached from initial temp to new temp to alert that the temperature changed, in amplitude (see model for more info)
    TEMPERATURE_ALERT_THRESHOLD: 1.5

  };


  friction.register( 'FrictionAlertManager', FrictionAlertManager );

  return FrictionAlertManager;
} );