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
  const LeftRightAlertPair = require( 'FRICTION/friction/view/describers/LeftRightAlertPair' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const MovementDescriber = require( 'FRICTION/friction/view/describers/MovementDescriber' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // a11y strings
  const moveDownToRubHarderSentenceString = FrictionA11yStrings.moveDownToRubHarderSentence.value;

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

      // {LeftRightAlertPair} - alert pairs to monitor if both left and right alerts have been triggered.
      this.contactedAlertPair = new LeftRightAlertPair();
      this.separatedAlertPair = new LeftRightAlertPair();

      // reset these properties when the contactProperty changes to false.
      model.contactProperty.link( ( newValue, oldValue ) => {

        // if the books were touching, and now they aren't, reset the ability for left/right alerts when contacted.
        if ( !newValue && oldValue ) {
          this.contactedAlertPair.reset(); // reset the pair monitoring the alerts when contacted.
        }
        else {
          this.separatedAlertPair.reset(); // reset the pair monitoring the alerts when not contacted.
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

          if ( !this.separatedAlertPair.bothAlerted() ) {
            this.alertDirections( directions );
            this.separatedAlertPair.updateFromDirections( directions );
          }
          else {
            utteranceQueue.addToBack( moveDownToRubHarderSentenceString );

            // This means that we will get left/right alerts again after a "move down" cue
            this.separatedAlertPair.reset(); // reset the cueing to only get this every other pair
          }
        }
        else if ( directions.length === 1 && // only one direction
                  directions.indexOf( DirectionEnum.RIGHT ) === 0 && // that direction is RIGHT
                  !this.contactedAlertPair.right ) { // haven't yet alerted RIGHT yet for this contact time
          this.alertDirections( directions );
          this.contactedAlertPair.updateFromDirections( directions );
        }
        else if ( directions.length === 1 && // only one direction
                  directions.indexOf( DirectionEnum.LEFT ) === 0 && // that direction is LEFT
                  !this.contactedAlertPair.left ) { // haven't yet alerted LEFT yet for this contact time
          this.alertDirections( directions );
          this.contactedAlertPair.updateFromDirections( directions );
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