// Copyright 2018, University of Colorado Boulder

/**
 * A generic accessibility  type that will alert positional alerts based on a locationProperty and a Bounds2 encapsulating the draggable area.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const friction = require( 'FRICTION/friction' );
  const DirectionEnum = require( 'FRICTION/friction/view/describers/DirectionEnum' );
  const Range = require( 'DOT/Range' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // threshold for diagonal movement is +/- 15 degrees from diagonals
  var DIAGONAL_MOVEMENT_THRESHOLD = 15 * Math.PI / 180;

  // mapping from alerting direction to the radian range that fills that space in the unit circle.
  var DIRECTION_MAP = {
    UP: new Range( -3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD ),
    DOWN: new Range( Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD ),
    RIGHT: new Range( -Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD ),

    // atan2 wraps around PI, so we will use absolute value in checks
    LEFT: new Range( 3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD, Math.PI ),

    UP_LEFT: new Range( -3 * Math.PI - DIAGONAL_MOVEMENT_THRESHOLD, -3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD ),
    DOWN_LEFT: new Range( 3 * Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, 3 * Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD ),
    UP_RIGHT: new Range( -Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, -Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD ),
    DOWN_RIGHT: new Range( Math.PI / 4 - DIAGONAL_MOVEMENT_THRESHOLD, Math.PI / 4 + DIAGONAL_MOVEMENT_THRESHOLD )
  };
  var DIRECTION_MAP_KEYS = Object.keys( DIRECTION_MAP );


  /**
   * TODO: support bottom alerts for general type
   * @param {Object} [options]
   * @constructor
   */
  class MovementDescriber {
    constructor( locationProperty, options ) {

      options = _.extend( {

        // {Bounds2}
        bounds: new Bounds2( Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY ),

        // {string|null} left, right, top, with values to alert if you reach that bound null if you don't want it alerted.
        leftBorderAlert: 'At left edge',
        rightBorderAlert: 'At right edge',
        topBorderAlert: 'At top',
        bottomBorderAlert: 'At bottom',

        // see DirectionEnum for allowed keys. Any missing keys will not be alerted.
        movementAlerts: {
          LEFT: 'left',
          RIGHT: 'right',
          UP: 'up',
          DOWN: 'down'
        },

        // if false then diagonal alerts will be converted to two primary direction alerts that are alerted back to back
        // i.e. UP_LEFT becomes "UP" and "LEFT"
        alertDiagonal: false,

        // the amount of movement change that must occur, units depend on that of the locationProperty
        movementThreshold: 50 // (totally arbitrary number)

      }, options );

      assert && assert( options.leftBorderAlert === null || typeof options.leftBorderAlert === 'string' );
      assert && assert( options.rightBorderAlert === null || typeof options.rightBorderAlert === 'string' );
      assert && assert( options.topBorderAlert === null || typeof options.topBorderAlert === 'string' );
      assert && assert( options.bottomBorderAlert === null || typeof options.bottomBorderAlert === 'string' );

      // @private
      this.bounds = options.bounds;
      this.movementThreshold = options.movementThreshold;
      this.movementAlerts = options.movementAlerts;
      this.alertDiagonal = options.alertDiagonal;
      this.borderAlerts = {
        left: options.leftBorderAlert,
        right: options.rightBorderAlert,
        top: options.topBorderAlert,
        bottom: options.bottomBorderAlert
      };

      // @protected
      this.locationProperty = locationProperty;
      this.lastAlertedLocation = locationProperty.get(); // initial value of the locationProperty

      locationProperty.link( ( newValue, oldValue ) => {

        // at left now, but wasn't last location
        if ( newValue.x === this.bounds.left && oldValue.x !== this.bounds.left ) {
          utteranceQueue.addToBackIfDefined( this.borderAlerts.left );
        }


        // at right now, but wasn't last location
        if ( newValue.x === this.bounds.right && oldValue.x !== this.bounds.right ) {
          utteranceQueue.addToBackIfDefined( this.borderAlerts.right );
        }

        // at top now, but wasn't last location
        if ( newValue.y === this.bounds.top && oldValue.y !== this.bounds.top ) {
          utteranceQueue.addToBackIfDefined( this.borderAlerts.top );
        }

        // at bottom now, but wasn't last location
        if ( newValue.y === this.bounds.bottom && oldValue.y !== this.bounds.bottom ) {
          utteranceQueue.addToBackIfDefined( this.borderAlerts.bottom );
        }
      } );
    }

    /**
     * @protected
     * @param {Array.<string>}directions
     */
    alertDirections( directions ) {

      // support if an instance doesn't want to alert in all directions
      directions.forEach( direction => {
        utteranceQueue.addToBack( new Utterance( this.movementAlerts[ direction ], { typeId: 'directionalMovement' + direction } ) );
      } );
      this.lastAlertedLocation = this.locationProperty.get();
    }

    /**
     * Alert a movement direction. The direction from this.lastAlertedLocation relative to the current value of the locationProperty
     * Call this from a listener or when the locationProperty has changed enough.
     * Can be overridden. Easy to implement method with the following schema:
     * (1) get the current value of the location property, and make sure it has changed enough from the lastAlertedLocation
     * (2) get the directions from the difference,
     * (3) alert those directions,
     * see friction/view/describers/BookMovementDescriber.
     * @public
     */
    alertDirectionalMovement() {

      var newLocation = this.locationProperty.get();
      if ( !newLocation.equals( this.lastAlertedLocation ) ) {

        var directions = this.getDirections( newLocation, this.lastAlertedLocation );

        // make sure that these alerts exist
        if ( assert ) {
          directions.map( direction => { assert( this.movementAlerts[ direction ] && typeof this.movementAlerts[ direction ] === 'string' ); } );
        }
        this.alertDirections( directions );
      }
    }

    /**
     * Get the direction of movement that would take you from point A to point B, returning one of DirectionEnum,
     * LEFT, RIGHT,  UP, DOWN,  UP_LEFT, UP_RIGHT, DOWN_LEFT, DOWN_RIGHT. Uses Math.atan2, so the angle is mapped from
     * 0 to +/- Math.PI.
     *
     * @param  {Vector2} pointA
     * @param  {Vector2} pointB
     * @returns {Array.<string>} - contains one or two of the values in DirectionEnum, depending on whether or no you get
     *                            diagonal directions or their composite. See options.alertDiagonal for more info
     * @static
     */
    getDirections( pointA, pointB ) {
      var direction;

      var dx = pointA.x - pointB.x;
      var dy = pointA.y - pointB.y;
      var angle = Math.atan2( dy, dx );

      // atan2 wraps around Math.PI, so special check for moving left from absolute value
      if ( DIRECTION_MAP.LEFT.contains( Math.abs( angle ) ) ) {
        direction = DirectionEnum.LEFT;
      }

      // otherwise, angle will be in one of the ranges in DIRECTION_MAP
      for ( var i = 0; i < DIRECTION_MAP_KEYS.length; i++ ) {
        var entry = DIRECTION_MAP[ DIRECTION_MAP_KEYS[ i ] ];
        if ( entry.contains( angle ) ) {
          direction = DirectionEnum[ DIRECTION_MAP_KEYS[ i ] ];
          break;
        }
      }

      // This includes complex directions like "UP_LEFT"
      if ( this.alertDiagonal ) {
        return [ direction ];
      }
      else {
        return DirectionEnum.directionToRelativeDirections( direction );
      }

    }

    reset() {
      // resetting will be needed
    }
  }

  return friction.register( 'MovementDescriber', MovementDescriber );
} );