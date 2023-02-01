// Copyright 2018-2023, University of Colorado Boulder

/**
 * This singleton type is responsible for alerting all aria-live alerts that pertain to the model/amplitude/temperature
 * increasing.
 * The basic algorithm: There is a list of alerts, each later alert uses verbage describing a relatively hotter model.
 * Each time you alert, you move up in the list, such that the next alert will alert with hotter verbage.
 *
 * The alert index restarts if there is enough time in between drags, signifying the end of the "drag session"
 * A drag session can consist of more than one dragging instance, but is ended if the time between drags is greater than
 * the "DRAG_SESSION_THRESHOLD"
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import stepTimer from '../../../../axon/js/stepTimer.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import { voicingUtteranceQueue } from '../../../../scenery/js/imports.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import FrictionStrings from '../../FrictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const moreString = FrictionStrings.a11y.temperature.more;
const fasterString = FrictionStrings.a11y.temperature.faster;
const nowHotterString = FrictionStrings.a11y.temperature.nowHotter;
const evenFasterString = FrictionStrings.a11y.temperature.evenFaster;
const warmerString = FrictionStrings.a11y.temperature.warmer;
const evenHotterString = FrictionStrings.a11y.temperature.evenHotter;

const superFastString = FrictionStrings.a11y.temperature.superFast;
const superHotString = FrictionStrings.a11y.temperature.superHot;

const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionStrings.a11y.frictionIncreasingAtomsJigglingTemperaturePattern;

// alert object for the Maximum temp alert
const MAX_TEMP_STRING = StringUtils.fillIn( frictionIncreasingAtomsJigglingTemperaturePatternString, {
  jigglingAmount: superFastString,
  temperature: superHotString
} );

// @private - mutated based on if the "reset" hint should be added
const MAX_TEMP_RESPONSE_PACKET = new ResponsePacket( {
  contextResponse: MAX_TEMP_STRING
} );

// Threshold that must be reached from initial temp to new temp to alert that the temperature changed, in amplitude (see model for more info)
const TEMPERATURE_ALERT_THRESHOLD = 1.5;

const INCREASING = [
  {
    jiggle: moreString,
    temp: warmerString
  },
  {
    jiggle: fasterString,
    temp: nowHotterString
  },
  {
    jiggle: evenFasterString,
    temp: evenHotterString
  }
];

// From model, the amplitude value when the atoms shear off
const SHEARING_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.shearingLimit;

// how long to wait until we consider this newest drag of a different "drag session", such
// that the warming alert progression will start over back at "warmer" alerts.
// in ms
const DRAG_SESSION_THRESHOLD = 1000;

// in ms, time in between each warming/increasing alert
const WARMING_ALERT_TIME_DELAY = 500;
const MAX_TEMP_ALERT_TIME_DELAY = 3000;

// The amount of amplitude that the model must decrease from the last point where it was increasing. This value
// is to help determine if the temperature is no longer increasing, while alowing for minor fluctuation. In same units
// as FrictionModel's amplitude
const AMPLITUDE_DECREASING_THRESHOLD = 0.4;


class TemperatureIncreasingAlerter extends Alerter {

  /**
   * Responsible for alerting when the temperature increases
   * @param {FrictionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    super( options );

    // @private
    this.model = model;

    // @private
    // Keep track of the time that the last drag ended. This is helpful to see if a new drag is within the same
    // "drag session", meaning that the alertIndex doesn't reset back to the first alert.
    // Default value is such that restart will always occur on first drag.
    this.timeOfLastDrag = 0;

    // @private
    this.initialAmplitude = model.vibrationAmplitudeProperty.value;

    // zero indexed, so the first one is 0
    // @private
    this.alertIndex = -1;

    // @private {boolean} - don't alert too many alerts all at once, these flags are only switched after a timeout
    this.tooSoonForNextWarmingAlert = false;
    this.tooSoonForNextMaxTempAlert = false;

    // @private {boolean} - keep track of if the model is increasing or now, with a special threshold specific to the
    // needs of this warming alerter. By "increasing" it also means stays the same, or lowers just a bit before increasing again.
    this.amplitudeIncreasing = false;

    // @private
    this.maxTempUtterance = new Utterance( {
      alert: MAX_TEMP_RESPONSE_PACKET,
      predicate: () => this.amplitudeIncreasing && model.vibrationAmplitudeProperty.value >= FrictionModel.THERMOMETER_MAX_TEMP,
      priority: Utterance.LOW_PRIORITY,
      announcerOptions: {

        // even though it is annoying to repeat these, it is better than hearing the beginning 10 times before hearing the actual alert.
        cancelSelf: false
      }
    } );

    // @private
    this.temperatureJiggleUtterance = new Utterance( {
      predicate: () => this.amplitudeIncreasing,
      alert: new ResponsePacket()
    } );

    let localMaxima = 0;

    // @private
    this.amplitudeListener = ( amplitude, oldAmplitude ) => {

      if ( amplitude > oldAmplitude ) {
        localMaxima = amplitude;
      }

      this.amplitudeIncreasing = !( localMaxima - amplitude > AMPLITUDE_DECREASING_THRESHOLD );

      // the difference in amplitude has to be greater than the threshold to alert
      if ( !this.tooSoonForNextWarmingAlert && amplitude < SHEARING_LIMIT && amplitude - this.initialAmplitude > TEMPERATURE_ALERT_THRESHOLD ) {
        this.alertIncrease();
      }
      else if ( !this.tooSoonForNextMaxTempAlert && amplitude >= FrictionModel.THERMOMETER_MAX_TEMP ) {
        this.alertMaxTemp();
      }

      // reset even without a new drag if we are settled.
      if ( amplitude <= FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
        this.onDrag();
        this.initializeAlerts();
      }
    };

    // exists for the lifetime of the sim, no need to dispose
    this.model.vibrationAmplitudeProperty.link( this.amplitudeListener );
  }

  /**
   * Reset the data so that the warming alerts will start over
   * @private
   */
  initializeAlerts() {
    this.alertIndex = -1; // reset

    // Normally, capture the initial amplitude as temperature regions change. But if already at the max, then set
    // amplitude to a very different number, so that max-temp alerts can continue to fire.
    this.initialAmplitude = this.model.vibrationAmplitudeProperty.value > FrictionModel.THERMOMETER_MAX_TEMP ?
                            this.model.vibrationAmplitudeProperty.initialValue :
                            this.model.vibrationAmplitudeProperty.value;
  }

  // @public
  // triggered on every keydown/mousedown
  startDrag() {

    // If longer than threshold, treat as new "drag session"
    if ( phet.joist.elapsedTime - this.timeOfLastDrag > DRAG_SESSION_THRESHOLD ) {
      this.initializeAlerts();
    }
  }

  /**
   * Called by amplitude listener in addition to on drag for resetting drag time.
   * @public
   */
  onDrag() {
    this.timeOfLastDrag = phet.joist.elapsedTime;
  }

  // @public
  endDrag() {
    if ( this.model.vibrationAmplitudeProperty.value >= FrictionModel.THERMOMETER_MAX_TEMP ) {
      this.forEachUtteranceQueue( utteranceQueue => {
        utteranceQueue.hasUtterance( this.temperatureJiggleUtterance ) && utteranceQueue.removeUtterance( this.temperatureJiggleUtterance );
      } );

      voicingUtteranceQueue.hasUtterance( this.temperatureJiggleUtterance ) && voicingUtteranceQueue.removeUtterance( this.temperatureJiggleUtterance );
    }
    this.timeOfLastDrag = phet.joist.elapsedTime;
  }

  // @private
  alertIncrease() {
    this.alertIndex++;
    const currentAlertIndex = Math.min( this.alertIndex, INCREASING.length - 1 );

    const alertObject = INCREASING[ currentAlertIndex ];

    this.temperatureJiggleUtterance.alert.contextResponse = StringUtils.fillIn( frictionIncreasingAtomsJigglingTemperaturePatternString, {
      temperature: alertObject.temp,
      jigglingAmount: alertObject.jiggle
    } );

    this.alert( this.temperatureJiggleUtterance );

    // reset the "initialAmplitude" to the current amplitude, because then it will take another whole threshold level to alert again
    this.initialAmplitude = this.model.vibrationAmplitudeProperty.value;

    // set to true to limit subsequent alerts firing rapidly
    this.tooSoonForNextWarmingAlert = true;
    stepTimer.setTimeout( () => { this.tooSoonForNextWarmingAlert = false; }, WARMING_ALERT_TIME_DELAY );
  }

  /**
   * Alert the maximum temperate alert, varied based on if it is the first time alerting.
   * @private
   */
  alertMaxTemp() {
    this.alert( this.maxTempUtterance );

    this.initialAmplitude = this.model.vibrationAmplitudeProperty.value;

    // set to true to limit subsequent alerts firing rapidly
    this.tooSoonForNextMaxTempAlert = true;
    stepTimer.setTimeout( () => { this.tooSoonForNextMaxTempAlert = false; }, MAX_TEMP_ALERT_TIME_DELAY );
  }

  /**
   * Reset the Describer
   * @public
   */
  reset() {
    this.temperatureJiggleUtterance.reset();
    this.maxTempUtterance.reset();
  }
}

friction.register( 'TemperatureIncreasingAlerter', TemperatureIncreasingAlerter );
export default TemperatureIncreasingAlerter;