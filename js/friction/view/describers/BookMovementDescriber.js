// Copyright 2018, University of Colorado Boulder

/**
 * MovementDescriber subtype that knows how to alert movement for Friction's chemistry book, which is pretty specific for a
 * freely draggable object.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const DirectionEnum = require( 'FRICTION/friction/view/describers/DirectionEnum' );
  const friction = require( 'FRICTION/friction' );
  const MovementDescriber = require( 'FRICTION/friction/view/describers/MovementDescriber' );

  // the singleton instance of this describer, used for the entire instance of the sim.
  let describer = null;

  /**
   * @param {Object} [options]
   * @constructor
   */
  class BookMovementDescriber extends MovementDescriber {
    constructor( model, options ) {

      super( model.topBookPositionProperty, options );

      // @private
      this.model = model;
      this.contactedAlertedLeft = false;
      this.contactedAlertedRight = false;

      // reset these properties when the contactProperty changes to false.
      model.contactProperty.link( ( newValue ) => {

        // if the books were touching, and now they aren't, reset the ability for left/right alerts when contacted.
        if ( !newValue ) {
          this.contactedAlertedLeft = false;
          this.contactedAlertedRight = false;
        }
      } );
    }


    /**
     * Alert a movement direction. Overridden for specific alert features for Friction, i.e. the alerts change if
     * the two books are in contact.
     * @override
     * @public
     */
    alertDirectionalMovement() {

      var newLocation = this.locationProperty.get();
      if ( !newLocation.equals( this.lastAlertedLocation ) ) {
        var directions = this.getDirections( newLocation, this.lastAlertedLocation );


        // If books aren't touching, then alert everything
        if ( !this.model.contactProperty.get() ) {
          this.alertDirections( directions );
        }
        else if ( directions.length === 1 && // only one direction
                  directions.indexOf( DirectionEnum.RIGHT ) === 0 && // that direction is RIGHT
                  !this.contactedAlertedRight ) { // haven't yet alerted RIGHT yet for this contact time
          this.alertDirections( directions );
          this.contactedAlertedRight = true;
        }
        else if ( directions.length === 1 && // only one direction
                  directions.indexOf( DirectionEnum.LEFT ) === 0 && // that direction is LEFT
                  !this.contactedAlertedLeft ) { // haven't yet alerted LEFT yet for this contact time
          this.alertDirections( directions );
          this.contactedAlertedLeft = true;
        }
      }
    }

    /**
     * Uses the singleton pattern to keep one instance of this describer for the entire lifetime of the sim.
     * @returns {BookMovementDescriber}
     */
    static getDescriber() {

      if ( describer ) {
        return describer;
      }
      assert && assert( arguments.length > 0, 'arg required to instantiate BreakAwayDescriber' );
      describer = new BookMovementDescriber( ...arguments ); // pass through all args despite through singleton boilerplate
      return describer;
    }

    // "initialize" method for clarity
    static initialize() {
      BookMovementDescriber.getDescriber( ...arguments ); // pass through all args despite through singleton boilerplate
    }
  }

  return friction.register( 'BookMovementDescriber', BookMovementDescriber );
} );