// Copyright 2018-2023, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import FrictionStrings from '../../FrictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const jigglingLessString = FrictionStrings.a11y.jiggle.jigglingLess;
const coolerString = FrictionStrings.a11y.temperature.cooler;
const nowCoolerString = FrictionStrings.a11y.temperature.nowCooler;
const lessString = FrictionStrings.a11y.jiggle.less;
const evenLessString = FrictionStrings.a11y.jiggle.evenLess;
const evenCoolerString = FrictionStrings.a11y.temperature.evenCooler;

const frictionIncreasingAtomsJigglingTemperatureFirstPatternString = FrictionStrings.a11y.frictionIncreasingAtomsJigglingTemperatureFirstPattern;
const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionStrings.a11y.frictionIncreasingAtomsJigglingTemperaturePattern;

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

// From model, the amplitude value when the atoms shear off
const SHEARING_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.shearingLimit;

// How long in between each subsequent decreasing alert
const ALERT_TIME_DELAY = 3000;

// The amount of amplitude that the model must decrease from the last point where it was increasing. This value
// is to help with minor fluctuations as the model "cools" itself every step even while friction is generally increasing.
// In same units as FrictionModel's amplitude
const AMPLITUDE_DECREASING_THRESHOLD = 1;

class TemperatureDecreasingAlerter extends Alerter {

  /**
   * Responsible for alerting when the temperature decreases
   * @param {FrictionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    super( options );

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
           amplitude < 0.8 * SHEARING_LIMIT && // don't alert cooling unless cooler than shearing limit, plus 20% grace
           phet.joist.elapsedTime - this.timeOfLastAlert > ALERT_TIME_DELAY ) { // If we have waited long enough
        this.alertDecrease();
      }

      // reset even without a new drag if we are settled.
      if ( amplitude <= FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
        this.alertIndex = -1; // reset
        this.timeOfLastAlert = 0; // immediately trigger the potential for an alert
      }
    };

    // @private
    this.utterance = new Utterance( {
      predicate: () => this.tempDecreasing,
      alert: new ResponsePacket(),
      announcerOptions: {
        cancelOther: false
      }
    } );

    // exists for the lifetime of the sim, no need to dispose
    this.model.vibrationAmplitudeProperty.link( this.amplitudeListener );
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
  endDrag() {
    this.timeOfLastAlert = 0; // immediately trigger the potential for an alert
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

    let alertObject = DECREASING[ currentAlertIndex ];

    let patternString = frictionIncreasingAtomsJigglingTemperaturePatternString;

    // Use the "first time" pattern string if it is the first time. Gracefully handle if there isn't a first time alert
    if ( alertObject.firstTime && this.firstAlert ) {
      patternString = frictionIncreasingAtomsJigglingTemperatureFirstPatternString;

      // use the fill in values for the first time
      alertObject = alertObject.firstTime;
    }

    this.utterance.alert.contextResponse = StringUtils.fillIn( patternString, {
      temperature: alertObject.temp,
      jigglingAmount: alertObject.jiggle
    } );

    this.alert( this.utterance );

    // it's not the first time anymore
    this.firstAlert = false;

    this.timeOfLastAlert = phet.joist.elapsedTime;
  }
}

friction.register( 'TemperatureDecreasingAlerter', TemperatureDecreasingAlerter );
export default TemperatureDecreasingAlerter;