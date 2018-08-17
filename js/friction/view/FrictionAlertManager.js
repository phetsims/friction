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
  const capitalizedVeryHotString = FrictionA11yStrings.capitalizedVeryHot.value;
  const moreString = FrictionA11yStrings.more.value;
  const breakAwaySentenceFirstString = FrictionA11yStrings.breakAwaySentenceFirst.value;
  const breakAwaySentenceAgainString = FrictionA11yStrings.breakAwaySentenceAgain.value;

  // a11y strings interactive alerts
  const stillVeryHotString = FrictionA11yStrings.stillVeryHot.value;
  const fasterString = FrictionA11yStrings.faster.value;
  const nowHotterString = FrictionA11yStrings.nowHotter.value;
  const evenFasterString = FrictionA11yStrings.evenFaster.value;
  const veryFastString = FrictionA11yStrings.veryFast.value;
  const jigglingLessString = FrictionA11yStrings.jigglingLess.value;
  const coolerString = FrictionA11yStrings.cooler.value;
  const warmerString = FrictionA11yStrings.warmer.value;
  const nowCoolerString = FrictionA11yStrings.nowCooler.value;
  const evenHotterString = FrictionA11yStrings.evenHotter.value;
  const veryHotString = FrictionA11yStrings.veryHot.value;
  const lessString = FrictionA11yStrings.less.value;
  const evenLessString = FrictionA11yStrings.evenLess.value;
  const evenCoolerString = FrictionA11yStrings.evenCooler.value;

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

  // Threshold that must be reached from initial temp to new temp to alert that the temperature changed, in amplitude (see model for more info)
  const TEMPERATURE_ALERT_THRESHOLD = 1.5;

  // sanity check to keep these in sync
  assert && assert( AMPLITUDE_RANGES.length === TEMPERATURE_ZONES.length );

  // break away sentences
  const BREAK_AWAY_THRESHOLD_FIRST = StringUtils.fillIn( breakAwaySentenceFirstString, { temp: capitalizedVeryHotString } );
  const BREAK_AWAY_THRESHOLD_AGAIN = StringUtils.fillIn( breakAwaySentenceAgainString, { temp: capitalizedVeryHotString } );

  // TODO manage this with reset in mind
  var alertedBreakAway = false;

  var FrictionAlertManager = {

    /**
     * @param {object} alertObject - data object holding strings for alert, see this.ALERT_SCHEMA
     * @param {boolean} firstTimeAlerting - if it is the first time alerting this alert, there could be a special case in the data object
     * @param {string} [typeId]
     */
    alertTemperatureJiggleFromObject: function( alertObject, firstTimeAlerting, typeId ) {

      let patternString = frictionIncreasingAtomsJigglingTemperaturePatternString;

      // Use the "first time" pattern string if it is the first time.
      if ( alertObject.firstTime && firstTimeAlerting ) {
        patternString = frictionIncreasingAtomsJigglingTemperatureFirstPatternString;

        // use the fill in values for the first time
        alertObject = alertObject.firstTime;
      }

      var string = StringUtils.fillIn( patternString, {
        temperature: alertObject.temp,
        jigglingAmount: alertObject.jiggle
      } );
      utteranceQueue.addToBack( new Utterance( string, { typeId } ) );
    },

    /**
     * Alert when the temperature has just reached the point where atoms begin to break away
     * @public
     */
    alertAtEvaporationThreshold: function() {
      utteranceQueue.addToFront( alertedBreakAway ? BREAK_AWAY_THRESHOLD_AGAIN : BREAK_AWAY_THRESHOLD_FIRST );
      alertedBreakAway = true;
    },


    // TODO: this is a hack, the type should be more public and well documented
    createIncreasingDescriber: function( model ) {
      this.increasingDescriber = new IncreasingDescriber( model );
    },

    dispose: function() {
      this.increasingDescriber && this.increasingDescriber.dispose();
    },

    DECREASING: [
      {
        jiggle: lessString,
        temp: nowCoolerString,
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
    ],

    INCREASING: [
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
      },
      {
        jiggle: veryFastString,
        temp: stillVeryHotString,
        firstTime: {
          jiggle: veryFastString,
          temp: veryHotString
        }
      }
    ],

    LESS: 'LESS',
    SAME: 'SAME',
    MORE: 'MORE'
  };


  /**
   * Responsible for alerting when the temperature increases
   */
  class IncreasingDescriber {
    constructor( model ) {
      this.model = model;

      // decides whether or not this describer is enabled basically.
      // just manages whether or not we are checking to see if the threshold is increasing enough
      this.tempIncreasing = false;

      this.initialAmplitude = model.amplitudeProperty.value;

      // zero indexed, so the first one is 0
      this.alertIndex = -1;

      this.increasingAlertSchema = FrictionAlertManager.INCREASING;

      this.tooSoonForNextAlert = false;

      this.amplitudeListener = ( amplitude ) => {

        if ( this.tempIncreasing && !this.tooSoonForNextAlert && amplitude - this.initialAmplitude > TEMPERATURE_ALERT_THRESHOLD ) {
          this.alertIncrease();
        }

      };
      this.model.amplitudeProperty.link( this.amplitudeListener );
    }

    // triggered on every keydown
    dragStarted() {
      this.initialAmplitude = this.model.amplitudeProperty.value;
      this.tempIncreasing = true;
    }

    dragEnded() {
      this.tempIncreasing = false;
      this.alertIndex = -1; //reset
    }

    alertIncrease() {
      this.alertIndex++;
      var currentAlertIndex = Math.min( this.alertIndex, this.increasingAlertSchema.length - 1 );

      // TODO manage the "first time" stuff
      FrictionAlertManager.alertTemperatureJiggleFromObject( this.increasingAlertSchema[ currentAlertIndex ], false, 'increasing' );

      console.log( this.alertIndex );
      this.tooSoonForNextAlert = true;

      // reset the "initialAmplitude" to the current amplitude, because then it will take another whole threshold level to alert again
      this.initialAmplitude = this.model.amplitudeProperty.value;

      // This is a bit buggy, we may want to tweak the threshold more, or find a better solution.
      setTimeout( () => { this.tooSoonForNextAlert = false; }, 500 ); // 1 second delay, TODO: use Timer for seed.
    }

    dispose() {
      this.model.amplitudeProperty.unlink( this.amplitudeListener );
    }
  }

  friction.register( 'FrictionAlertManager', FrictionAlertManager );

  return FrictionAlertManager;
} );