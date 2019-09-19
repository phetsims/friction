// Copyright 2018-2019, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );

  // a11y strings
  const jigglingLessString = FrictionA11yStrings.jigglingLess.value;
  const coolerString = FrictionA11yStrings.cooler.value;
  const nowCoolerString = FrictionA11yStrings.nowCooler.value;
  const lessString = FrictionA11yStrings.less.value;
  const evenLessString = FrictionA11yStrings.evenLess.value;
  const evenCoolerString = FrictionA11yStrings.evenCooler.value;

  const DECREASING = [
    {
      jiggle: lessString,
      temp: coolerString,
      firstTime: {
        jiggle: jigglingLessString,
        temp: coolerString
      }
    },
    {
      jiggle: lessString,
      temp: nowCoolerString
    },
    {
      jiggle: evenLessString,
      temp: evenCoolerString
    }
  ];

  // From model, the amplitude value when the atoms evaporate
  const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;

  // How long in between each subsequent decreasing alert
  const ALERT_TIME_DELAY = 3000;

  // The amount of amplitude that the model must decrease from the last point where it was increasing. This value
  // is to help with minor fluctuations as the model "cools" itself every step even while friction is generally increasing.
  // In same units as FrictionModel's amplitude
  const AMPLITUDE_DECREASING_THRESHOLD = 1;

  /**
   * Responsible for alerting when the temperature increases
   * @param {Object} [options]
   * @constructor
   */
  class TemperatureDecreasingDescriber {
    constructor( model ) {

      // decides whether or not this describer is enabled basically.
      // just manages whether or not we are checking to see if the threshold is increasing enough
      // @public
      this.tempDecreasing = false;

      // @private
      this.model = model;

      // @private
      // This keeps track of the time since the last decreasing alert was made
      this.timeOfLastAlert = 0;

      // zero indexed, so the first one is 0
      this.alertIndex = -1;

      // Keep track of the last highest amplitude when it was increasing. This value is reset everytime the oldAmplitude
      // is less that the new amplitude.
      // @private
      let lastAmplitudeWhenIncreasing = model.vibrationAmplitudeProperty.value;

      // Different alert for the very first decrease alert we have for the lifetime of the sim
      // @private
      this.firstAlert = true;

      // @private
      this.amplitudeListener = ( amplitude, oldAmplitude ) => {

        // if ever we increase amplitude, make it the new maximum to compare against when determining if we are "decreasing in temp"
        if ( amplitude > oldAmplitude ) {
          lastAmplitudeWhenIncreasing = amplitude;
        }

        // manage which way th temp is going
        this.tempDecreasing = lastAmplitudeWhenIncreasing - amplitude > AMPLITUDE_DECREASING_THRESHOLD;

        // we consider it "settled" at this threshold
        if ( amplitude < FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
          this.tempDecreasing = false;
        }

        // If we meet criteria, then alert that temp/amplitude is decreasing
        if ( this.tempDecreasing && // only if the temperature is decreasing
             amplitude > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD && // when amplitude is close enough to its settled state, don't alert anymore\
             amplitude < EVAPORATION_LIMIT && // don't alert cooling unless cooler than evaporation limit
             phet.joist.elapsedTime - this.timeOfLastAlert > ALERT_TIME_DELAY ) { // If we have waited long enough
          this.alertDecrease();
        }
      };

      // exists for the lifetime of the sim, no need to dispose
      this.model.vibrationAmplitudeProperty.link( this.amplitudeListener );

      // handle the "settled and cool" alert once temp is completely decreased.
      // lazyLink so that we do not hear the alert on startup
      // exists for the lifetime of the sim, no need to dispose
      model.vibrationAmplitudeProperty.lazyLink( amplitude => {
        if ( amplitude === model.vibrationAmplitudeProperty.initialValue ) {
          FrictionAlertManager.alertSettledAndCool();
        }
      } );
    }

    /**
     * Should be called when a drag starts
     * @public
     */
    startDrag() {
      this.alertIndex = -1; //reset
    }

    /**
     * @public
     */
    reset() {
      this.firstAlert = true;
    }

    /**
     * @private
     */
    alertDecrease() {
      this.alertIndex++;
      const currentAlertIndex = Math.min( this.alertIndex, DECREASING.length - 1 );

      const alertObject = DECREASING[ currentAlertIndex ];

      FrictionAlertManager.alertTemperatureJiggleFromObject( alertObject, this.firstAlert, 'decreasing' );

      // it's not the first time anymore
      this.firstAlert = false;

      this.timeOfLastAlert = phet.joist.elapsedTime;
    }
  }

  return friction.register( 'TemperatureDecreasingDescriber', TemperatureDecreasingDescriber );
} );