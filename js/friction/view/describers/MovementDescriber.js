// Copyright 2018, University of Colorado Boulder

/**
 * A generic accessibility  type that will alert positional alerts based on a locationProperty and a Bounds2 encapsulating the draggable area.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const DirectionEnum = require( 'FRICTION/friction/view/describers/DirectionEnum' );
  const friction = require( 'FRICTION/friction' );
  const Range = require( 'DOT/Range' );
  const Util = require( 'DOT/Util' );
  const Utterance = require( 'SCENERY_PHET/accessibility/Utterance' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // threshold for diagonal movement is +/- 15 degrees from diagonals
  let DIAGONAL_MOVEMENT_THRESHOLD = 15 * Math.PI / 180;

  // mapping from alerting direction to the radian range that fills that space in the unit circle.
  let DIRECTION_MAP = {
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
  let DIRECTION_MAP_KEYS = Object.keys( DIRECTION_MAP );

  /**
   * @param {Object} [options]
   * @constructor
   */
  class MovementDescriber {
    constructor( locationProperty, options ) {

      options = _.extend( {

        // {Bounds2}
        bounds: new Bounds2( Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY ),

        // {string|null|Array.<string>} left, right, top, with values to alert if you reach that bound null if you don't want it alerted.
        // If an array of string, each alert in the array will be read each new time that alert occurs. The last alert in
        // the list will be read out each subsequent time if the alert occurs more than the number of items in the list.
        leftBorderAlert: 'At left edge',
        rightBorderAlert: 'At right edge',
        topBorderAlert: 'At top',
        bottomBorderAlert: 'At bottom',

        // see DirectionEnum for allowed keys. Any missing keys will not be alerted. Use `{}` to omit movementAlerts
        movementAlerts: {
          LEFT: 'left',
          RIGHT: 'right',
          UP: 'up',
          DOWN: 'down'
        },

        // if false then diagonal alerts will be converted to two primary direction alerts that are alerted back to back
        // i.e. UP_LEFT becomes "UP" and "LEFT"
        alertDiagonal: false
      }, options );

      assert && assert( Array.isArray( options.leftBorderAlert ) ||
                        options.leftBorderAlert === null ||
                        typeof options.leftBorderAlert === 'string' );

      assert && assert( Array.isArray( options.rightBorderAlert ) ||
                        options.rightBorderAlert === null ||
                        typeof options.rightBorderAlert === 'string' );

      assert && assert( Array.isArray( options.topBorderAlert ) ||
                        options.topBorderAlert === null ||
                        typeof options.topBorderAlert === 'string' );

      assert && assert( Array.isArray( options.bottomBorderAlert ) ||
                        options.bottomBorderAlert === null ||
                        typeof options.bottomBorderAlert === 'string' );

      assert && assert( options.movementAlerts instanceof Object );
      assert && assert( !Array.isArray( options.movementAlerts ) ); // should not be an Array
      if ( assert ) {
        const movementAlertKeys = Object.keys( options.movementAlerts );

        for ( let i = 0; i < movementAlertKeys.length; i++ ) {
          let key = movementAlertKeys[ i ];
          assert( DirectionEnum.keys.indexOf( key ) >= 0, `unexpected key: ${key}. Keys should be the same as those in DirectionEnum` );
        }
      }

      // @private
      this.bounds = options.bounds;
      this.movementAlerts = options.movementAlerts;
      this.alertDiagonal = options.alertDiagonal;
      this.borderAlerts = {
        left: {
          alert: options.leftBorderAlert,
          numberOfTimesAlerted: 0
        },
        right: {
          alert: options.rightBorderAlert,
          numberOfTimesAlerted: 0
        },
        top: {
          alert: options.topBorderAlert,
          numberOfTimesAlerted: 0
        },
        bottom: {
          alert: options.bottomBorderAlert,
          numberOfTimesAlerted: 0
        }
      };

      // @protected
      this.locationProperty = locationProperty;
      this.lastAlertedLocation = locationProperty.get(); // initial value of the locationProperty

      locationProperty.link( ( newValue, oldValue ) => {

        // at left now, but wasn't last location
        if ( newValue.x === this.bounds.left && oldValue.x !== this.bounds.left ) {
          utteranceQueue.addToBackIfDefined( this.getAlertFromBorderAlertsObject( 'left' ) );
        }


        // at right now, but wasn't last location
        if ( newValue.x === this.bounds.right && oldValue.x !== this.bounds.right ) {
          utteranceQueue.addToBackIfDefined( this.getAlertFromBorderAlertsObject( 'right' ) );
        }

        // at top now, but wasn't last location
        if ( newValue.y === this.bounds.top && oldValue.y !== this.bounds.top ) {
          utteranceQueue.addToBackIfDefined( this.getAlertFromBorderAlertsObject( 'top' ) );
        }

        // at bottom now, but wasn't last location
        if ( newValue.y === this.bounds.bottom && oldValue.y !== this.bounds.bottom ) {
          utteranceQueue.addToBackIfDefined( this.getAlertFromBorderAlertsObject( 'bottom' ) );
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

      let newLocation = this.locationProperty.get();
      if ( !newLocation.equals( this.lastAlertedLocation ) ) {

        let directions = this.getDirections( newLocation, this.lastAlertedLocation );

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
      let direction;

      let dx = pointA.x - pointB.x;
      let dy = pointA.y - pointB.y;
      let angle = Math.atan2( dy, dx );

      // atan2 wraps around Math.PI, so special check for moving left from absolute value
      if ( DIRECTION_MAP.LEFT.contains( Math.abs( angle ) ) ) {
        direction = DirectionEnum.LEFT;
      }

      // otherwise, angle will be in one of the ranges in DIRECTION_MAP
      for ( let i = 0; i < DIRECTION_MAP_KEYS.length; i++ ) {
        let entry = DIRECTION_MAP[ DIRECTION_MAP_KEYS[ i ] ];
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

    /**
     * A borderAlertObject is defined in the constructor, and has two properties: "alert" and "numberOfTimesALerted"
     * The goal of this function is to get the appropriate alert from that object given the number
     * of times it has been alerted.
     * @param {string} whichBorder - the key cooresponding to which border alert needs to be retrieved
     * @returns {string|Array.<string>|null} - same type as what is permitted by border alert options
     */
    getAlertFromBorderAlertsObject( whichBorder ) {
      const borderAlertObject = this.borderAlerts[ whichBorder ];
      if ( Array.isArray( borderAlertObject.alert ) ) {
        let index = Util.clamp( borderAlertObject.numberOfTimesAlerted, 0, borderAlertObject.alert.length - 1 );
        borderAlertObject.numberOfTimesAlerted++;
        return borderAlertObject.alert[ index ];
      }

      // If not an array, then just return the alert
      return borderAlertObject.alert;
    }

    reset() {
      this.borderAlerts.left.numberOfTimesAlerted = 0;
      this.borderAlerts.right.numberOfTimesAlerted = 0;
      this.borderAlerts.top.numberOfTimesAlerted = 0;
      this.borderAlerts.bottom.numberOfTimesAlerted = 0;
    }
  }

  return friction.register( 'MovementDescriber', MovementDescriber );
} );