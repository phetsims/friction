// Copyright 2018, University of Colorado Boulder

/**
 * sound generator used to produce a sound like two things being rubbed together
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const friction = require( 'FRICTION/friction' );
  const NoiseGenerator = require( 'TAMBO/sound-generators/NoiseGenerator' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );

  // constants
  const FRICTION_SOUND_CENTER_FREQUENCY = 1000; // Hz
  const FRICTION_SOUND_VARIATION = 0.15; // proportion
  const DIRECTION_SWITCH_LOCKOUT_TIME = 0.030; // in seconds
  const STILLNESS_TIME = 0.1; // in seconds, time used to determine when the book becomes still
  const STOP_DURATION = 0.1; // in seconds

  /**
   * {Property.<Vector2>} topBookPositionProperty - location of the top book
   * {BooleanProperty} contactProperty - whether the books are in contact with one another
   * {Object} [options] - options, see parent classes for more information
   * @constructor
   */
  function BookRubSoundGenerator( topBookPositionProperty, contactProperty, options ) {

    options = _.extend( {
        noiseType: 'pink',
        centerFrequency: FRICTION_SOUND_CENTER_FREQUENCY,
        qFactor: 2,
        initialOutputLevel: 0,
        maxOutputLevel: 1
      },
      options
    );

    NoiseGenerator.call( this, options );

    // @private - state variables needed to update the sound output
    this.topBookXVelocityProperty = new NumberProperty( 0 );
    this.timeOfLastXVelocityUpdate = Number.NEGATIVE_INFINITY;
    this.rubSoundLockedOutProperty = new BooleanProperty( false ); // used to create sonic space on direction changes
    this.rubSoundLockoutCounter = 0;

    // monitor the position of the top book and update local state variables as needed for the sound generator
    topBookPositionProperty.lazyLink( ( topBookPosition, previousTopBookPosition ) => {
      const now = Date.now() / 1000;
      this.topBookXVelocityProperty.set( ( topBookPosition.x - previousTopBookPosition.x ) /
                                         ( now - this.timeOfLastXVelocityUpdate ) );
      this.timeOfLastXVelocityUpdate = now;
    } );

    // monitor the velocity for a direction change
    this.topBookXVelocityProperty.link( ( velocity, previousVelocity ) => {

      if ( velocity > 0 && ( previousVelocity === 0 || previousVelocity < 0 ) ) {

        // the book has changed direction, now moving to the right
        this.setBandpassFilterCenterFrequency( FRICTION_SOUND_CENTER_FREQUENCY * ( 1 + FRICTION_SOUND_VARIATION ) );
        this.rubSoundLockedOutProperty.set( true );
        this.rubSoundLockoutCounter = DIRECTION_SWITCH_LOCKOUT_TIME;
      }
      else if ( velocity < 0 && ( previousVelocity === 0 || previousVelocity > 0 ) ) {

        // the book has changed direction, now moving to the left
        this.setBandpassFilterCenterFrequency( FRICTION_SOUND_CENTER_FREQUENCY * ( 1 - FRICTION_SOUND_VARIATION ) );
        this.rubSoundLockedOutProperty.set( true );
        this.rubSoundLockoutCounter = DIRECTION_SWITCH_LOCKOUT_TIME;
      }
    } );

    // set the output level based on the state of several properties
    Property.multilink(
      [ this.topBookXVelocityProperty, contactProperty, this.rubSoundLockedOutProperty ],
      ( topBookXVelocity, contact, rubSoundLockedOut ) => {
        if ( contact && Math.abs( topBookXVelocity ) > 0 && !rubSoundLockedOut ) {

          if ( !this.isPlaying ) {
            this.start();
          }

          // There really isn't an easily determined hard limit to the velocity, since it depends on how fast a user
          // can drag, so this value is derived from experimenting with fairly rapid drags.
          const maxVelocity = 2000;

          // calculate a normalized absolute value of the velocity
          const normalizedVelocity = Math.min( Math.abs( topBookXVelocity / maxVelocity ), 1 );

          // set the output level based on the velocity of the book
          const noiseAmplitude = options.maxOutputLevel * Math.pow( normalizedVelocity, 0.5 );
          this.setOutputLevel( noiseAmplitude, 0.1 );
        }
        else {
          if ( this.isPlaying ) {
            this.stop( this.audioContext.currentTime + STOP_DURATION );
          }
          this.setOutputLevel( 0, STOP_DURATION );
        }
      }
    );
  }

  friction.register( 'BookRubSoundGenerator', BookRubSoundGenerator );

  return inherit( NoiseGenerator, BookRubSoundGenerator, {

    /**
     * step function that mostly detects when the top book stops moving and helps create the silence intervals between
     * direction changes
     * @param {number} dt - amount of time step, in seconds
     * @public
     */
    step: function( dt ) {

      // check to see if the book as stopped moving
      const now = Date.now() / 1000;
      if ( Math.abs( this.topBookXVelocityProperty.value ) > 0 &&
           now - this.timeOfLastXVelocityUpdate > STILLNESS_TIME ) {

        // there have been no updates to the velocity in a while, assume the book is now still
        this.topBookXVelocityProperty.set( 0 );
        this.timeOfLastXVelocityUpdate = now;
      }

      // update the lockout timer if it is running
      if ( this.rubSoundLockoutCounter > 0 ) {
        this.rubSoundLockoutCounter = Math.max( this.rubSoundLockoutCounter - dt, 0 );
        if ( this.rubSoundLockoutCounter === 0 ) {
          this.rubSoundLockedOutProperty.set( false );
        }
      }
    }

  } );
} );
