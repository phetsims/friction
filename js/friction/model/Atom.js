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
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // constants
  var EVAPORATED_SPEED = 400; // speed that particles travel during evaporation, in model units per second

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

    // @public {Property.<Vector2>} - the position of the Atom relative to its origin TODO: I don't think this comment is correct
    this.positionProperty = new Property( new Vector2( options.x, options.y ), {
      phetioType: PropertyIO( Vector2IO ),
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // TODO - required params are in the options, not good.
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

    // @private {Vector2} - velocity vector for evaporation
    this.evaporationVelocity = new Vector2( 0, 0 );

    // move the atom as the top book moves if it is part of that book
    var motionVector = new Vector2(); // Optimization to minimize garbage collection.
    model.topBookPositionProperty.lazyLink( function( newPosition, oldPosition ) {
      if ( self.isTopAtom && !self.isEvaporated ) {
        motionVector.set( newPosition );
        motionVector.subtract( oldPosition );
        self.originX = self.originX + motionVector.x;
        self.originY = self.originY + motionVector.y;
      }
    } );
  }

  friction.register( 'Atom', Atom );

  return inherit( Object, Atom, {

    /**
     * when the oscillation has exceeded the threshold, the atom breaks off, animates to one side of the screen, and
     * disappears
     * @public
     */
    evaporate: function() {
      assert && assert( !this.isEvaporated, 'Atom was already evaporated' );

      this.isEvaporated = true;
      var evaporationDestinationX = this.model.width * ( phet.joist.random.nextBoolean() ? 1 : -1 );
      var evaporationDestinationY = this.positionProperty.get().y -
                                    this.model.distanceBetweenBooksProperty.get() * phet.joist.random.nextDouble();

      this.evaporationVelocity.setXY(
        evaporationDestinationX - this.positionProperty.get().x,
        evaporationDestinationY - this.positionProperty.get().y
      ).setMagnitude( EVAPORATED_SPEED );
    },

    /**
     * restore the initial conditions
     * @public
     */
    reset: function() {
      this.originX = this.initialX;
      this.originY = this.initialY;
      this.isEvaporated = false;
    },

    /**
     * step the atom forward in time
     * @param dt - delta time, in seconds
     * @public
     */
    step: function( dt ) {

      // update the atom's position based on vibration and center position
      var newPosition = new Vector2(
        this.originX + this.model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 ),
        this.originY + this.model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 )
      );
      this.positionProperty.set( newPosition );

      // if evaporated, move away (but don't bother continuing once the atom is out of view)
      if ( this.isEvaporated && Math.abs( this.originX ) < 4 * this.model.width ) {
        this.originX += this.evaporationVelocity.x * dt;
        this.originY += this.evaporationVelocity.y * dt;
      }
    }
  } );
} );