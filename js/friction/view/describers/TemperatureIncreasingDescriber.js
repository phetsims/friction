// Copyright 2018-2020, University of Colorado Boulder

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

import stepTimer from '../../../../../axon/js/stepTimer.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import Utterance from '../../../../../utterance-queue/js/Utterance.js';
import friction from '../../../friction.js';
import frictionStrings from '../../../frictionStrings.js';
import FrictionModel from '../../model/FrictionModel.js';
import FrictionAlertManager from '../FrictionAlertManager.js';

// constants
const moreString = frictionStrings.a11y.temperature.more;
const fasterString = frictionStrings.a11y.temperature.faster;
const nowHotterString = frictionStrings.a11y.temperature.nowHotter;
const evenFasterString = frictionStrings.a11y.temperature.evenFaster;
const warmerString = frictionStrings.a11y.temperature.warmer;
const evenHotterString = frictionStrings.a11y.temperature.evenHotter;

const superFastString = frictionStrings.a11y.temperature.superFast;
const superHotString = frictionStrings.a11y.temperature.superHot;

const resetSimMoreObservationSentenceString = frictionStrings.a11y.resetSimMoreObservationSentence;
const frictionIncreasingAtomsJigglingTemperaturePatternString = frictionStrings.a11y.frictionIncreasingAtomsJigglingTemperaturePattern;

// alert object for the Maximum temp alert
const MAX_TEMP_STRING = StringUtils.fillIn( frictionIncreasingAtomsJigglingTemperaturePatternString, {
  jigglingAmount: superFastString,
  temperature: superHotString
} );

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

/**
 * Responsible for alerting when the temperature increases
 * @param {Object} [options]
 * @constructor
 */
class TemperatureIncreasingDescriber {
  constructor( model ) {

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

    this.maxTempUtterance = new Utterance( {
      alert: [ MAX_TEMP_STRING, MAX_TEMP_STRING, resetSimMoreObservationSentenceString ],
      loopAlerts: true
    } );

    // @private
    this.amplitudeListener = amplitude => {

      if ( !this.tooSoonForNextAlert && // don't alert a subsequent alert too quickly

           // the difference in amplitude has to be greater than the threshold to alert
           amplitude - this.initialAmplitude > FrictionAlertManager.TEMPERATURE_ALERT_THRESHOLD ) {

        if ( amplitude < EVAPORATION_LIMIT ) {
          this.alertIncrease();
        }
        else if ( amplitude > FrictionModel.THERMOMETER_MAX_TEMP ) {
          this.alertMaxTemp();
        }
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
      this.alertIndex = -1; //reset
      this.initialAmplitude = this.model.vibrationAmplitudeProperty.value;
    }
  }

  // @public
  endDrag() {
    this.timeOfLastDrag = phet.joist.elapsedTime;
  }

  // @private
  alertIncrease() {
    this.alertIndex++;
    const currentAlertIndex = Math.min( this.alertIndex, INCREASING.length - 1 );

    const alertObject = INCREASING[ currentAlertIndex ];

    this.alert( () => {
      FrictionAlertManager.alertTemperatureJiggleFromObject( alertObject, false, 'increasing' );
    } );
  }

  /**
   * Alert the maximum temperate alert, varried based on if it is the first time alerting.
   * @private
   */
  alertMaxTemp() {
    this.alert( () => { phet.joist.sim.utteranceQueue.addToBack( this.maxTempUtterance ); } );
  }

  /**
   * General alert for this type, manages the timing and threshold values to make sure that alerts
   * happen at the right moments.
   * @param {function} alertFunction - when called, this function should alert.
   * @private
   */
  alert( alertFunction ) {
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
    this.maxTempUtterance.reset(); // reset the maximum alerts
  }
}

friction.register( 'TemperatureIncreasingDescriber', TemperatureIncreasingDescriber );
export default TemperatureIncreasingDescriber;