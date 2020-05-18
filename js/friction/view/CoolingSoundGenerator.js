// Copyright 2018-2020, University of Colorado Boulder

/**
 * sound generator used to produce a sound when the temperature of the books is going down, i.e. the system is cooling
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import NoiseGenerator from '../../../../tambo/js/sound-generators/NoiseGenerator.js';
import friction from '../../friction.js';

// constants
const AMPLITUDE_AVERAGING_ARRAY_LENGTH = 10;
const COOLING_SOUND_DELAY = 0.25; // delay before playing the cooling sound after cooling is detected, in seconds
const COOLING_SOUND_DURATION = 2; // amount of time cooling sound plays, in seconds

class CoolingSoundGenerator extends NoiseGenerator {

  /**
   * {NumberProperty} moleculeOscillationAmplitudeProperty - position of the top book
   * {Object} [options] - options, see parent classes for more information
   * @constructor
   */
  constructor( moleculeOscillationAmplitudeProperty, options ) {

    options = merge( {
        noiseType: 'pink',
        centerFrequency: 6000,
        qFactor: 4,
        initialOutputLevel: 0,
        maxOutputLevel: 1
      },
      options
    );

    super( options );

    // @private {number} - max output level, used in the step function that updates the sound output level
    this.maxOutputLevel = options.maxOutputLevel;

    // @private {number} - most recent and previous oscillation values, used to calculate change rate history
    this.mostRecentAmplitudeValue = 0;
    this.previousAmplitudeValue = 0;

    // @private {number[]} - array that tracks previous amplitude change rates, used to detect cooling
    this.amplitudeChangeRateHistory = [];

    // @private {number} - time which the molecules have been cooling, i.e. oscillation amplitude has been going down
    this.continuousCoolingTime = 0;

    // monitor the molecule oscillation amplitude and update local state
    moleculeOscillationAmplitudeProperty.lazyLink( amplitude => {
      this.mostRecentAmplitudeValue = amplitude;
    } );
  }

  /**
   * step function that calculates the molecule oscillation change rate and updates the level of the cooling sound
   * @param {number} dt - amount of time step, in seconds
   * @public
   */
  step( dt ) {

    // calculate the rate of change for the amplitude
    const amplitudeChangeRate = ( this.mostRecentAmplitudeValue - this.previousAmplitudeValue ) / dt;
    this.previousAmplitudeValue = this.mostRecentAmplitudeValue;

    // keep track of the history of the amplitude change rate so that it can be averaged
    this.amplitudeChangeRateHistory.push( amplitudeChangeRate );
    if ( this.amplitudeChangeRateHistory.length > AMPLITUDE_AVERAGING_ARRAY_LENGTH ) {
      this.amplitudeChangeRateHistory.splice( 0, 1 );
    }

    // calculate the average change rate
    const averageChangeRate =
      this.amplitudeChangeRateHistory.reduce( ( total, num ) => total + num ) / AMPLITUDE_AVERAGING_ARRAY_LENGTH;

    // keep track of whether the molecules are cooling off and, if so, for how long
    if ( this.amplitudeChangeRateHistory.length === AMPLITUDE_AVERAGING_ARRAY_LENGTH && averageChangeRate < 0 ) {
      this.continuousCoolingTime += dt;
    }
    else {
      this.continuousCoolingTime = 0;
    }

    // update the state of the "cooling" sound
    let targetOutputLevel = 0;
    if ( this.continuousCoolingTime > COOLING_SOUND_DELAY ) {

      // Calculate a scaling factor for the output level of the cooling sound that is based on how long the
      // sound should be played and on how fast it is cooling.  This results in a level that only plays for a
      // fixed duration and gets quieter as the molecules approach what is essentially room temperature.
      const scalingFactor =
        ( 1 - Math.min( ( this.continuousCoolingTime - COOLING_SOUND_DELAY ) / COOLING_SOUND_DURATION, 1 ) ) *
        Math.min( Math.abs( averageChangeRate ), 1 );

      // calculate the target output level as a function of the max output and the scaling factor
      targetOutputLevel = this.maxOutputLevel * scalingFactor;
    }
    if ( this.outputLevel !== targetOutputLevel ) {
      if ( targetOutputLevel > 0 ) {

        // start the noise generator if it isn't already running
        if ( !this.isPlaying ) {
          this.start();
        }

        // set the output level using an empirically determined time constant such that changes sound smooth
        this.setOutputLevel( targetOutputLevel, 0.07 );
      }
      else {

        // stop the noise generator in a way that fades rapidly but not TOO abruptly
        this.setOutputLevel( targetOutputLevel, 0.2 );
        this.stop( this.audioContext.currentTime + 0.01 );
      }
    }
  }

}

friction.register( 'CoolingSoundGenerator', CoolingSoundGenerator );

export default CoolingSoundGenerator;