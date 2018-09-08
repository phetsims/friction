// Copyright 2018, University of Colorado Boulder

/**
 * Describer responsible for handling the appropriate alert when atoms evaporate, or "break away" from the top book.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( ( require ) => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // a11y strings
  const capitalizedVeryHotString = FrictionA11yStrings.capitalizedVeryHot.value;
  const breakAwaySentenceFirstString = FrictionA11yStrings.breakAwaySentenceFirst.value;
  const breakAwaySentenceAgainString = FrictionA11yStrings.breakAwaySentenceAgain.value;

  // constants

  // break away sentences
  const BREAK_AWAY_THRESHOLD_FIRST = StringUtils.fillIn( breakAwaySentenceFirstString, { temp: capitalizedVeryHotString } );
  const BREAK_AWAY_THRESHOLD_AGAIN = StringUtils.fillIn( breakAwaySentenceAgainString, { temp: capitalizedVeryHotString } );

  // const ALERT_TIME_DELAY = 3000;

  // The amount of amplitude that the model must decrease from the last point where it was increasing. This value
  // is to help with minor fluctuations as the model "cools" itself every step even while friction is generally increasing.
  // const AMPLITUDE_DECREASING_THRESHOLD = 1;

  const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;


  // the singleton instance of this describer, used for the entire instance of the sim.
  let describer = null;

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


      // @private
      this.amplitudeListener = ( amplitude, oldAmplitude ) => {
        // Handle the alert when amplitude is high enough to begin evaporating
        if ( amplitude > EVAPORATION_LIMIT && oldAmplitude < EVAPORATION_LIMIT && // just hit evaporation limit
             model.numberOfAtomsEvaporated < FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS ) { // still atoms to evaporate
          this.alertAtEvaporationThreshold( this.alertedBreakAwayProperty.value );
          this.alertedBreakAwayProperty.value = true;
        }
      };


      this.model.amplitudeProperty.link( this.amplitudeListener );

// lazyLink so that we do not hear the alert on startup
      model.amplitudeProperty.lazyLink( amplitude => {
        if ( amplitude === model.amplitudeProperty.initialValue ) {
          FrictionAlertManager.alertSettledAndCool();
        }
      } );
    }


    /**
     * Alert when the temperature has just reached the point where atoms begin to break away
     * @param {boolean} alertedBreakAwayBefore - whether or not the alert has been said before
     * @public
     */
    alertAtEvaporationThreshold( alertedBreakAwayBefore ) {
      utteranceQueue.addToFront( alertedBreakAwayBefore ? BREAK_AWAY_THRESHOLD_AGAIN : BREAK_AWAY_THRESHOLD_FIRST );
    }

    /**
     * @public
     */
    reset() {
      this.alertedBreakAwayProperty.reset();
    }


    /**
     * Uses the singleton pattern to keep one instance of this describer for the entire lifetime of the sim.
     * @param {FrictionModel} [model]
     * @returns {*}
     */
    static getDescriber( model ) {

      if ( describer ) {
        return describer;
      }
      assert && assert( model, 'arg required to instantiate BreakAwayDescriber' );
      describer = new BreakAwayDescriber( model );
      return describer;
    }

    // "initialize" method for clarity
    static initialize( model ) {
      BreakAwayDescriber.getDescriber( model );
    }
  }

  return friction.register( 'BreakAwayDescriber', BreakAwayDescriber );
} );