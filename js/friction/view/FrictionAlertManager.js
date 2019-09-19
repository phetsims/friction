// Copyright 2018-2019, University of Colorado Boulder

/**
 * Manager for the alerts that are dynamically emitted in the simulation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // a11y strings
  const frictionIncreasingAtomsJigglingTemperatureFirstPatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperatureFirstPattern.value;
  const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperaturePattern.value;
  const atomsJiggleTinyBitTempCoolString = FrictionA11yStrings.atomsJiggleTinyBitTempCool.value;

  // utterance for announcing temperature and particle changes, persistent reference to use
  // alertStableDelay feature of utterance
  const temperatureJiggleUtterance = new Utterance();

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

      temperatureJiggleUtterance.alert = string;
      utteranceQueue.addToBack( temperatureJiggleUtterance );
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