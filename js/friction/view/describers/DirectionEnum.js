// Copyright 2018, University of Colorado Boulder

/**
 * Possible directions for a freely draggable item; it can move up, down, left, right,
 * and along the diagonals of these orientations.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );

  var DirectionEnum = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    UP: 'UP',
    DOWN: 'DOWN',
    UP_LEFT: 'UP_LEFT',
    UP_RIGHT: 'UP_RIGHT',
    DOWN_LEFT: 'DOWN_LEFT',
    DOWN_RIGHT: 'DOWN_RIGHT',

    /**
     * Returns true if direction is one of the primary relative directions "up", "down", "left", "right".
     *
     * @param {string} direction - one of DirectionEnum
     * @return {Boolean}
     */
    isRelativeDirection: function( direction ) {
      assert && assert( DirectionEnum.hasOwnProperty( direction ) );
      return direction === DirectionEnum.LEFT ||
             direction === DirectionEnum.RIGHT ||
             direction === DirectionEnum.UP ||
             direction === DirectionEnum.DOWN;
    },

    /**
     * If the direction is a complex diagonal direction, break it up into its composite pieces
     * @returns {Array.<string>}
     */
    directionToRelativeDirections: function( direction ) {
      assert && assert( DirectionEnum.hasOwnProperty( direction ) );
      return direction === DirectionEnum.UP_LEFT ? [ DirectionEnum.UP, DirectionEnum.LEFT ] :
             direction === DirectionEnum.UP_RIGHT ? [ DirectionEnum.UP, DirectionEnum.RIGHT ] :
             direction === DirectionEnum.DOWN_LEFT ? [ DirectionEnum.DOWN, DirectionEnum.LEFT ] :
             direction === DirectionEnum.DOWN_RIGHT ? [ DirectionEnum.DOWN, DirectionEnum.RIGHT ] :
               [ DirectionEnum[ direction ] ]; // primary relative direction, so return a single item in the array
    }
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( DirectionEnum ); }

  friction.register( 'DirectionEnum', DirectionEnum );

  return DirectionEnum;
} );