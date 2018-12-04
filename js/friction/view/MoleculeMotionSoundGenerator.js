// Copyright 2018, University of Colorado Boulder

/**
 * a sound generator used to indicate the amount of molecule motion in the Friction simulation
 *
 * @author John Blanco
 */

// Copyright 2018, University of Colorado Boulder

/**
 * sound generator used for indicating the position of the arm in the John Travoltage sim, may be generalized at some
 * future for other purposes
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const friction = require( 'FRICTION/friction' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const SoundClip = require( 'TAMBO/sound-generators/SoundClip' );
  const SoundGenerator = require( 'TAMBO/sound-generators/SoundGenerator' );

  // sounds
  const bounceMarimbaSound = require( 'sound!FRICTION/bounce-marimba.mp3' );

  /**
   * @constructor
   * {Property.<number>} moleculeAmplitudeProperty - amplitude of molecule motion
   * {Object} [options]
   */
  function MoleculeMotionSoundGenerator( moleculeAmplitudeProperty, options ) {

    options = _.extend( {
      maxOutputLevel: 1 // max gain for this sound generator, sets the overall output of this sound generator
    }, options );

    SoundGenerator.call( this, options );

    // create several instances of the sound clip at different volume levels to allow more variation in the sound
    const motionSoundClips = [
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 1 } ),
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 0.75 } ),
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 0.5 } ),
      new SoundClip( bounceMarimbaSound, { initialOutputLevel: 0.25 } )
    ];

    // connect up the sound clips
    motionSoundClips.forEach( motionSoundClip => {
      motionSoundClip.connect( this.masterGainNode );
    } );

    moleculeAmplitudeProperty.lazyLink( amplitude => {

      // normalize the amplitude value
      const normalizedAmplitude = ( amplitude - 1 ) / FrictionModel.VIBRATION_AMPLITUDE_MAX;

      // map normalized amplitude to volume
      const moleculeMotionSoundVolume = Math.pow( normalizedAmplitude, 1.5 );
      this.setOutputLevel( options.maxOutputLevel * moleculeMotionSoundVolume );

      // choose a sound clip (this creates variation in the output level for each play operation)
      const soundClip = phet.joist.random.sample( motionSoundClips );

      // set the playback rate in a way that sounds good with other sounds that are playing
      soundClip.playbackRate = FrictionConstants.GET_RANDOM_PENTATONIC_PLAYBACK_RATE();

      soundClip.play();
    } );
  }

  friction.register( 'MoleculeMotionSoundGenerator', MoleculeMotionSoundGenerator );

  inherit( SoundGenerator, MoleculeMotionSoundGenerator );

  return inherit( SoundGenerator, MoleculeMotionSoundGenerator );
} );
