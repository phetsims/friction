// Copyright 2018-2019, University of Colorado Boulder

/**
 * Describer responsible for handling the appropriate alert when atoms evaporate, or "break away" from the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const timer = require( 'AXON/timer' );
  const utteranceQueue = require( 'UTTERANCE_QUEUE/utteranceQueue' );

  // a11y strings
  const capitalizedVeryHotString = FrictionA11yStrings.capitalizedVeryHot.value;
  const breakAwaySentenceFirstString = FrictionA11yStrings.breakAwaySentenceFirst.value;
  const breakAwaySentenceAgainString = FrictionA11yStrings.breakAwaySentenceAgain.value;
  const breakAwayNoneLeftString = FrictionA11yStrings.breakAwayNoneLeft.value;

  // constants

  // break away sentences
  const BREAK_AWAY_THRESHOLD_FIRST = StringUtils.fillIn( breakAwaySentenceFirstString, { temp: capitalizedVeryHotString } );
  const BREAK_AWAY_THRESHOLD_AGAIN = StringUtils.fillIn( breakAwaySentenceAgainString, { temp: capitalizedVeryHotString } );
  const BREAK_AWAY_NONE_LEFT = StringUtils.fillIn( breakAwayNoneLeftString, { temp: capitalizedVeryHotString } );

  // time in between "break away sessions". This is the minimum amount of time to wait before hearing a subsequent break
  // away alert
  const ALERT_TIME_DELAY = 2000;
  const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;

  /**
   * Responsible for alerting when the temperature increases
   * @param {Object} [options]
   * @constructor
   */
  class BreakAwayDescriber {
    constructor( model ) {

      // @private
      this.model = model;


      // @private - (a11y) true if there has already been an alert about atoms breaking away
      this.alertedBreakAwayProperty = new BooleanProperty( false );

      // private
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

      // If there aren't any more atoms to break away
      if ( this.model.numberOfAtomsEvaporated >= FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS ) {
        assert && assert( this.alertedBreakAwayProperty.value, 'If this is the first alert, then we have problems' );
        utteranceQueue.addToFront( BREAK_AWAY_NONE_LEFT );
      }
      else {
        utteranceQueue.addToFront( this.alertedBreakAwayProperty.value ? BREAK_AWAY_THRESHOLD_AGAIN : BREAK_AWAY_THRESHOLD_FIRST );
      }

      this.alertedBreakAwayProperty.value = true;
      this.tooSoonForNextAlert = true;
      timer.setTimeout( () => { this.tooSoonForNextAlert = false; }, ALERT_TIME_DELAY );
    }

    /**
     * @public
     */
    reset() {
      this.alertedBreakAwayProperty.reset(); // get the "first time" break away alert on reset
    }
  }

  return friction.register( 'BreakAwayDescriber', BreakAwayDescriber );
} );