// Copyright 2018, University of Colorado Boulder

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
define( ( require ) => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const timer = require( 'PHET_CORE/timer' );

  // a11y strings
  const moreString = FrictionA11yStrings.more.value;
  const fasterString = FrictionA11yStrings.faster.value;
  const nowHotterString = FrictionA11yStrings.nowHotter.value;
  const evenFasterString = FrictionA11yStrings.evenFaster.value;
  const warmerString = FrictionA11yStrings.warmer.value;
  const evenHotterString = FrictionA11yStrings.evenHotter.value;

  const stillVeryHotString = FrictionA11yStrings.stillVeryHot.value;
  const veryFastString = FrictionA11yStrings.veryFast.value;
  const veryHotString = FrictionA11yStrings.veryHot.value;

  // alert object for the Maximum temp alert
  const MAX_TEMP_OBJECT = {
    jiggle: veryFastString,
    temp: stillVeryHotString,
    firstTime: {
      jiggle: veryFastString,
      temp: veryHotString
    }
  };


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


  // in ms, how long to wait until we consider this newest drag of a different "drag session"
  const DRAG_SESSION_THRESHOLD = 1000;

  // time in between each increasing alert
  const ALERT_TIME_DELAY = 500;

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

      // @private
      // Keep track of the time that the last drag ended. This is helpful to see if a new drag is within the same
      // "drag session", meaning that the alertIndex doesn't reset back to the first alert.
      // Default value is such that restart will always occur on first drag.
      this.timeOfLastDrag = 0;

      // @private
      this.initialAmplitude = model.amplitudeProperty.value;

      // zero indexed, so the first one is 0
      // @private
      this.alertIndex = -1;

      // Whether or not the "maximum" temperature alert has been alerted yet, should reset on screen reset.
      // @private
      this.firstTimeAlertingMaxProperty = new BooleanProperty( true );

      // {boolean} don't alert too many alerts all at once, this is only switched after a timeout, see alertIncrease
      // @private
      this.tooSoonForNextAlert = false;

      // @private
      // TODO: performance: put in drag callback instead?
      this.amplitudeListener = ( amplitude ) => {

        if ( !this.tooSoonForNextAlert && // don't alert a subsequent alert too quickly

             // the difference in amplitude has to be greater than the threshold to alert
             amplitude - this.initialAmplitude > FrictionAlertManager.TEMPERATURE_ALERT_THRESHOLD ) {

          if ( amplitude < EVAPORATION_LIMIT ) {
            this.alertIncrease();
          }

          // TODO: do we want a bit of a threshold hotter than the evap limit to hit to alert max?
          else {
            this.alertMaxTemp();
          }
        }

      };

      // exists for the lifetime of the sim, no need to dispose
      this.model.amplitudeProperty.link( this.amplitudeListener );
    }

    // @public
    // triggered on every keydown/mousedown
    dragStarted() {

      // If longer than threshold, treat as new "drag session"
      if ( phet.joist.elapsedTime - this.timeOfLastDrag > DRAG_SESSION_THRESHOLD ) {
        this.alertIndex = -1; //reset
        this.initialAmplitude = this.model.amplitudeProperty.value;
      }
    }

    // @public
    dragEnded() {
      this.timeOfLastDrag = phet.joist.elapsedTime;
    }

    // @private
    alertIncrease() {
      this.alertIndex++;
      let currentAlertIndex = Math.min( this.alertIndex, INCREASING.length - 1 );

      let alertObject = INCREASING[ currentAlertIndex ];

      this.alert( alertObject, false );

    }

    /**
     * Alert the maximum temperate alert, varried based on if it is the first time alerting.
     * @private
     */
    alertMaxTemp() {

      this.alert( MAX_TEMP_OBJECT, this.firstTimeAlertingMaxProperty.value );
      this.firstTimeAlertingMaxProperty.value = false;
    }

    /**
     * General alert for this type, manages the timing and threshold values to make sure that alerts
     * happen at the right moments.
     * @param {Object} alertObject
     * @param {boolean} firstTime - is it the first time alerting this object?
     * @private
     */
    alert( alertObject, firstTime ) {
      FrictionAlertManager.alertTemperatureJiggleFromObject( alertObject, firstTime, 'increasing' );

      // set to true to limit subsequent alerts firing rapidly
      this.tooSoonForNextAlert = true;

      // reset the "initialAmplitude" to the current amplitude, because then it will take another whole threshold level to alert again
      this.initialAmplitude = this.model.amplitudeProperty.value;

      // This is a bit buggy, we may want to tweak the threshold more, or find a better solution.
      timer.setTimeout( () => { this.tooSoonForNextAlert = false; }, ALERT_TIME_DELAY );
    }

    /**
     * Reset the Describer
     * @public
     */
    reset() {
      this.firstTimeAlertingMaxProperty.reset(); // we want the "First time" alert on each reset
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