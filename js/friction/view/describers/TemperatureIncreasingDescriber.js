// Copyright 2018, University of Colorado Boulder

/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( ( require ) => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const Timer = require( 'PHET_CORE/Timer' );

  // a11y strings
  const moreString = FrictionA11yStrings.more.value;
  const stillVeryHotString = FrictionA11yStrings.stillVeryHot.value;
  const fasterString = FrictionA11yStrings.faster.value;
  const nowHotterString = FrictionA11yStrings.nowHotter.value;
  const evenFasterString = FrictionA11yStrings.evenFaster.value;
  const veryFastString = FrictionA11yStrings.veryFast.value;
  const warmerString = FrictionA11yStrings.warmer.value;
  const evenHotterString = FrictionA11yStrings.evenHotter.value;
  const veryHotString = FrictionA11yStrings.veryHot.value;

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
    },
    {
      jiggle: veryFastString,
      temp: stillVeryHotString,
      firstTime: {
        jiggle: veryFastString,
        temp: veryHotString
      }
    }
  ];

  // the singleton instance of this describer, used for the entire instance of the sim.
  let describer = null;

  /**
   * Responsible for alerting when the temperature increases
   * @param {Object} [options]
   * @constructor
   */
  class TemperatureIncreasingDescriber {
    constructor( model ) {
      this.model = model;

      // decides whether or not this describer is enabled basically.
      // just manages whether or not we are checking to see if the threshold is increasing enough
      this.tempIncreasing = false;

      this.initialAmplitude = model.amplitudeProperty.value;

      // zero indexed, so the first one is 0
      this.alertIndex = -1;

      //
      this.tooSoonForNextAlert = false;

      this.amplitudeListener = ( amplitude ) => {

        if ( this.tempIncreasing && !this.tooSoonForNextAlert && amplitude - this.initialAmplitude > FrictionAlertManager.TEMPERATURE_ALERT_THRESHOLD ) {
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
      var currentAlertIndex = Math.min( this.alertIndex, INCREASING.length - 1 );

      // TODO manage the "first time" stuff
      FrictionAlertManager.alertTemperatureJiggleFromObject( INCREASING[ currentAlertIndex ], false, 'increasing' );

      this.tooSoonForNextAlert = true;

      // reset the "initialAmplitude" to the current amplitude, because then it will take another whole threshold level to alert again
      this.initialAmplitude = this.model.amplitudeProperty.value;

      // This is a bit buggy, we may want to tweak the threshold more, or find a better solution.
      Timer.setTimeout( () => { this.tooSoonForNextAlert = false; }, 500 );
    }
  }

  /**
   * Uses the singleton pattern to keep one instance of this describer for the entire lifetime of the sim.
   * @param {FrictionModel} [model]
   * @returns {*}
   */
  TemperatureIncreasingDescriber.getDescriber = ( model ) => {

    if ( describer ) {
      return describer;
    }
    assert && assert( model, 'arg required to instantiate TemperatureIncreasingDescriber' );
    describer = new TemperatureIncreasingDescriber( model );
    return describer;
  };


  return friction.register( 'TemperatureIncreasingDescriber', TemperatureIncreasingDescriber );
} );