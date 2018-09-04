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
  const timer = require( 'PHET_CORE/timer' );

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

      // @private
      this.model = model;

      // decides whether or not this describer is enabled basically.
      // just manages whether or not we are checking to see if the threshold is increasing enough
      // @private
      this.tempIncreasing = false;

      // @private
      this.initialAmplitude = model.amplitudeProperty.value;

      // zero indexed, so the first one is 0
      // @private
      this.alertIndex = -1;

      // Different alert for the very first decrease alert we have for the lifetime of the sim
      // @private
      this.firstAlert = true;

      // {boolean} don't alert too many alerts all at once, this is only switched after a timeout, see alertIncrease
      // @private
      this.tooSoonForNextAlert = false;

      // @private
      this.amplitudeListener = ( amplitude ) => {

        if ( this.tempIncreasing && !this.tooSoonForNextAlert && amplitude - this.initialAmplitude > FrictionAlertManager.TEMPERATURE_ALERT_THRESHOLD ) {
          this.alertIncrease();
        }

      };
      this.model.amplitudeProperty.link( this.amplitudeListener );
    }

    // triggered on every keydown
    // @public
    dragStarted() {
      this.initialAmplitude = this.model.amplitudeProperty.value;
      this.tempIncreasing = true;
    }

    // @public
    dragEnded() {
      this.tempIncreasing = false;
      this.alertIndex = -1; //reset
    }

    // @private
    alertIncrease() {
      this.alertIndex++;
      let currentAlertIndex = Math.min( this.alertIndex, INCREASING.length - 1 );

      let alertObject = INCREASING[ currentAlertIndex ];
      let firstTime = this.firstAlert;

      // only set it to not be the "first time" if the object has a firstTime sub object. This is to support the fact
      // that the only "first time" special alert is not the first alert that will be alerted (because its the "vert hot" alert
      if ( this.firstAlert && alertObject.firstTime ) {
        this.firstAlert = false;
      }
      FrictionAlertManager.alertTemperatureJiggleFromObject( alertObject, firstTime, 'increasing' );

      this.tooSoonForNextAlert = true;

      // reset the "initialAmplitude" to the current amplitude, because then it will take another whole threshold level to alert again
      this.initialAmplitude = this.model.amplitudeProperty.value;

      // This is a bit buggy, we may want to tweak the threshold more, or find a better solution.
      timer.setTimeout( () => { this.tooSoonForNextAlert = false; }, 500 );
    }

    /**
     * Uses the singleton pattern to keep one instance of this describer for the entire lifetime of the sim.
     * @param {FrictionModel} [model] - if not present, then the describer must be initialized already
     * @returns {TemperatureIncreasingDescriber}
     */
    static getDescriber( model ) {

      if ( describer ) {
        return describer;
      }
      assert && assert( model, 'arg required to instantiate TemperatureIncreasingDescriber' );
      describer = new TemperatureIncreasingDescriber( model );
      return describer;
    }

    // "initialize" method for clarity
    static initialize( model ) {
      TemperatureIncreasingDescriber.getDescriber( model );
    }
  }

  return friction.register( 'TemperatureIncreasingDescriber', TemperatureIncreasingDescriber );
} );