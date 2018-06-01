// Copyright 2013-2018, University of Colorado Boulder

/**
 * Model for a single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // constants
  var STEPS = 250; // steps until atom has completed evaporation movement

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Atom( model, tandem, options ) {
    var self = this;

    // @public (read-only) {boolean} flag records whether we are on the top book
    this.isTopAtom = options.color === FrictionConstants.TOP_BOOK_ATOMS_COLOR;

    // @private - marked as true when the atom is evaporated
    this.isEvaporated = false;

    // @public {Property.<Vector2>} - the position of the Atom relative to its origin
    this.positionProperty = new Property( new Vector2(), {
      phetioType: PropertyIO( Vector2IO ),
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // @private {number} - origin for oscillation
    this.originX = options.x;

    // @private {number} - origin for oscillation
    this.originY = options.y;

    // @private {FrictionModel}
    this.model = model;

    // @private {number} initial coordinate for resetting
    this.initialX = options.x;

    // @private {number} initial coordinate for resetting
    this.initialY = options.y;

    // move the atom as the top book moves if it is part of that book
    var motionVector = new Vector2(); // Optimization to minimize garbage collection.
    model.bookPositionProperty.lazyLink( function( newPosition, oldPosition ) {
      if ( self.isTopAtom && !self.isEvaporated ) {
        motionVector.set( newPosition );
        motionVector.subtract( oldPosition );
        self.originX = self.originX + motionVector.x;
        self.originY = self.originY + motionVector.y;
      }
    } );

    // update atom's position based on vibration and center position
    model.stepEmitter.addListener( function() {
      var newPosition = new Vector2(
        self.originX + model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 ),
        self.originY + model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 )
      );
      self.positionProperty.set( newPosition );
    } );
  }

  friction.register( 'Atom', Atom );

  return inherit( Object, Atom, {

    /**
     * When the oscillation has exceeded the threshold, the Atom animates to one side of the screen and disappears.
     * @public
     */
    evaporate: function() {
      assert && assert( !this.isEvaporated, 'Atom was already evaporated' );
      var self = this;

      this.isEvaporated = true;

      var evaporationDestinationX = this.originX + 4 * this.model.width * ( Util.roundSymmetric( phet.joist.random.nextDouble() ) - 0.5 );
      var dx = ( evaporationDestinationX - this.originX ) / STEPS;

      var yRange = this.model.distanceProperty.get() + this.model.magnifiedAtomsInfo.distanceY * this.model.toEvaporate.length;
      var evaporationDestinationY = this.originY + phet.joist.random.nextDouble() * 1.5 * yRange;
      var dy = ( evaporationDestinationY - this.originY ) / STEPS;

      // @private {function} evaporation motion handler
      this.handler = function() {
        self.originX += dx;
        self.originY -= dy;

        if ( Math.abs( self.originX ) > 4 * self.model.width ) {
          self.model.stepEmitter.removeListener( self.handler );
        }
      };

      this.model.stepEmitter.addListener( self.handler );
    },

    /**
     * Restores the initial conditions.
     * @public
     */
    reset: function() {
      this.originX = this.initialX;
      this.originY = this.initialY;

      // handler may have been unlinked by itself (see above), so check that we're still registered
      if ( this.model.stepEmitter.hasListener( this.handler ) ) {
        this.model.stepEmitter.removeListener( this.handler );
      }
      this.isEvaporated = false;
    }
  } );
} );