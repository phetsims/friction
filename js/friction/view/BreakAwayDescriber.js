// Copyright 2018-2021, University of Colorado Boulder

/**
 * Describer responsible for handling the appropriate alert when atoms evaporate, or "break away" from the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import voicingUtteranceQueue from '../../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const capitalizedVeryHotString = frictionStrings.a11y.temperature.capitalizedVeryHot;
const breakAwaySentenceFirstString = frictionStrings.a11y.breakAwaySentenceFirst;
const breakAwaySentenceAgainString = frictionStrings.a11y.breakAwaySentenceAgain;
const breakAwayNoneLeftString = frictionStrings.a11y.breakAwayNoneLeft;

// break away sentences
const BREAK_AWAY_THRESHOLD_FIRST = StringUtils.fillIn( breakAwaySentenceFirstString, { temp: capitalizedVeryHotString } );
const BREAK_AWAY_THRESHOLD_AGAIN = StringUtils.fillIn( breakAwaySentenceAgainString, { temp: capitalizedVeryHotString } );
const BREAK_AWAY_NONE_LEFT = StringUtils.fillIn( breakAwayNoneLeftString, { temp: capitalizedVeryHotString } );

// time in between "break away sessions". This is the minimum amount of time to wait before hearing a subsequent break
// away alert
const ALERT_TIME_DELAY = 2000;
const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;

class BreakAwayDescriber extends Alerter {

  /**
   * Responsible for alerting when the temperature increases
   * @param {FrictionModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {

    super( options );

    // @private
    this.model = model;

    // @private - (a11y) true if there has already been an alert about atoms breaking away
    this.alertedBreakAwayProperty = new BooleanProperty( false );

    // @private
    this.tooSoonForNextAlert = false;

    // @private
    this.amplitudeListener = ( amplitude, oldAmplitude ) => {

      // Handle the alert when amplitude is high enough to begin evaporating
      if ( !this.tooSoonForNextAlert && // alert only separate "break away events"
           amplitude > EVAPORATION_LIMIT && oldAmplitude < EVAPORATION_LIMIT ) { // just hit evaporation limit
        this.alertAtEvaporationThreshold();
      }
    };

    // exists for the lifetime of the sim, no need to dispose
    this.model.vibrationAmplitudeProperty.link( this.amplitudeListener );
  }


  /**
   * Alert when the temperature has just reached the point where atoms begin to break away
   * @public
   */
  alertAtEvaporationThreshold() {
    let alertContent = null;

    // If there aren't any more atoms to break away
    if ( this.model.numberOfAtomsEvaporated >= FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS ) {
      assert && assert( this.alertedBreakAwayProperty.value, 'If this is the first alert, then we have problems' );
      alertContent = BREAK_AWAY_NONE_LEFT;
    }
    else {
      alertContent = this.alertedBreakAwayProperty.value ? BREAK_AWAY_THRESHOLD_AGAIN : BREAK_AWAY_THRESHOLD_FIRST;
    }

    this.forEachUtteranceQueue( utteranceQueue => utteranceQueue.addToFront( alertContent ) );

    voicingUtteranceQueue.addToFront( alertContent );

    this.alertedBreakAwayProperty.value = true;
    this.tooSoonForNextAlert = true;
    stepTimer.setTimeout( () => { this.tooSoonForNextAlert = false; }, ALERT_TIME_DELAY );
  }

  /**
   * @public
   */
  reset() {
    this.alertedBreakAwayProperty.reset(); // get the "first time" break away alert on reset
  }
}

friction.register( 'BreakAwayDescriber', BreakAwayDescriber );
export default BreakAwayDescriber;