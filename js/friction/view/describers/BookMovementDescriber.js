// Copyright 2018, University of Colorado Boulder

/**
 * MovementDescriber subtype that knows how to alert movement for Friction's chemistry book, which is pretty specific for a
 * freely draggable object.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
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