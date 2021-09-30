// Copyright 2018-2021, University of Colorado Boulder

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
import voicingUtteranceQueue from '../../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const moreString = frictionStrings.a11y.temperature.more;
const fasterString = frictionStrings.a11y.temperature.faster;
const nowHotterString = frictionStrings.a11y.temperature.nowHotter;
const evenFasterString = frictionStrings.a11y.temperature.evenFaster;
const warmerString = frictionStrings.a11y.temperature.warmer;
const evenHotterString = frictionStrings.a11y.temperature.evenHotter;

const superFastString = frictionStrings.a11y.temperature.superFast;
const superHotString = frictionStrings.a11y.temperature.superHot;

const frictionIncreasingAtomsJigglingTemperaturePatternString = frictionStrings.a11y.frictionIncreasingAtomsJigglingTemperaturePattern;

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

// From model, the amplitude value when the atoms evaporate
const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;

// how long to wait until we consider this newest drag of a different "drag session", such
// that the warming alert progression will start over back at "warmer" alerts.
// in ms
const DRAG_SESSION_THRESHOLD = 1000;

// in ms, time in between each increasing alert
const ALERT_TIME_DELAY = 500;

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

    // {boolean} don't alert too many alerts all at once, this is only switched after a timeout, see alertIncrease
    // @private
    this.tooSoonForNextAlert = false;

    // @private
    this.maxTempUtterance = new Utterance( {
      alert: MAX_TEMP_RESPONSE_PACKET,
      announcerOptions: {

        // even though it is annoying to repeat these, it is better than hearing the beginning 10 times before hearing the actual alert.
        cancelSelf: false
      }
    } );

    // @private
    this.temperatureJiggleUtterance = new Utterance( {
      alert: new ResponsePacket()
    } );

    // @private
    this.amplitudeListener = amplitude => {

      // don't alert a subsequent alert too quickly
      if ( this.tooSoonForNextAlert ) {
        return;
      }

      // the difference in amplitude has to be greater than the threshold to alert
      if ( amplitude < EVAPORATION_LIMIT && amplitude - this.initialAmplitude > TEMPERATURE_ALERT_THRESHOLD ) {
        this.alertIncrease();
      }
      else if ( amplitude >= FrictionModel.THERMOMETER_MAX_TEMP ) {
        this.alertMaxTemp();
      }

    };

    // exists for the lifetime of the sim, no need to dispose
    this.model.vibrationAmplitudeProperty.link( this.amplitudeListener );
  }

  // @public
  // triggered on every keydown/mousedown
  startDrag() {

    // If longer than threshold, treat as new "drag session"
    if ( phet.joist.elapsedTime - this.timeOfLastDrag > DRAG_SESSION_THRESHOLD ) {
      this.alertIndex = -1; // reset

      // Normally, capture the initial amplitude as temperature regions change. But if already at the max, then set
      // amplitude to a very different number, so that max-temp alerts can continue to fire.
      this.initialAmplitude = this.model.vibrationAmplitudeProperty.value > FrictionModel.THERMOMETER_MAX_TEMP ?
                              this.model.vibrationAmplitudeProperty.initialValue :
                              this.model.vibrationAmplitudeProperty.value;
    }
  }

  /**
   * @public
   */
  onDrag() {
    this.timeOfLastDrag = phet.joist.elapsedTime;
  }

  // @public
  endDrag() {

    voicingUtteranceQueue.hasUtterance( this.temperatureJiggleUtterance ) && voicingUtteranceQueue.removeUtterance( this.temperatureJiggleUtterance );
    this.timeOfLastDrag = phet.joist.elapsedTime;
  }

  // @private
  alertIncrease() {
    this.alertIndex++;
    const currentAlertIndex = Math.min( this.alertIndex, INCREASING.length - 1 );

    this.alertImplementationWithTimingVariables( () => {
      const alertObject = INCREASING[ currentAlertIndex ];

      this.temperatureJiggleUtterance.alert.contextResponse = StringUtils.fillIn( frictionIncreasingAtomsJigglingTemperaturePatternString, {
        temperature: alertObject.temp,
        jigglingAmount: alertObject.jiggle
      } );

      this.alert( this.temperatureJiggleUtterance );
    } );
  }

  /**
   * Alert the maximum temperate alert, varied based on if it is the first time alerting.
   * @private
   */
  alertMaxTemp() {
    this.alertImplementationWithTimingVariables( () => {

      // TODO: use the same Utterance for both of these queues, see https://github.com/phetsims/friction/issues/204
      this.alert( this.maxTempUtterance );
    } );
  }

  /**
   * General alert for this type, manages the timing and threshold values to make sure that alerts
   * happen at the right moments.
   * @param {function} alertFunction - when called, this function should alert.
   * @private
   */
  alertImplementationWithTimingVariables( alertFunction ) {
    alertFunction();

    // set to true to limit subsequent alerts firing rapidly
    this.tooSoonForNextAlert = true;

    // reset the "initialAmplitude" to the current amplitude, because then it will take another whole threshold level to alert again
    this.initialAmplitude = this.model.vibrationAmplitudeProperty.value;

    // This is a bit buggy, we may want to tweak the threshold more, or find a better solution.
    stepTimer.setTimeout( () => { this.tooSoonForNextAlert = false; }, ALERT_TIME_DELAY );
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