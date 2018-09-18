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
      return direction === DirectionEnum.LEFT ||
             direction === DirectionEnum.RIGHT ||
             direction === DirectionEnum.UP ||
             direction === DirectionEnum.DOWN;
    }
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( DirectionEnum ); }

  friction.register( 'DirectionEnum', DirectionEnum );

  return DirectionEnum;
} );
