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
  const friction = require( 'FRICTION/friction' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Property = require( 'AXON/Property' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  let EVAPORATED_SPEED = 400; // speed that particles travel during evaporation, in model units per second

  /**
   * @param {Vector2} initialPosition
   * @param {FrictionModel} model
   * @param {boolean} isTopAtom
   * @param {Tandem} tandem
   * @constructor
   */
  function Atom( initialPosition, model, isTopAtom, tandem ) {
    let self = this;

    // @private {Vector2} - initial position, used during resets
    this.initialPosition = initialPosition;

    // @private {FrictionModel}
    this.model = model;

    // @public (read-only) {boolean} - flag that indicates whether this atom is part of the top book
    this.isTopAtom = isTopAtom;

    // @private - marked as true when the atom is evaporated
    this.isEvaporated = false;

    // @public {Property.<Vector2>} - the position of the atom
    this.positionProperty = new Property( initialPosition );

    // @private {Vector2} - the center position, around which oscillations occur
    this.centerPosition = new Vector2( initialPosition.x, initialPosition.y );

    // @private {Vector2} - velocity vector for evaporation
    this.evaporationVelocity = new Vector2( 0, 0 );

    if ( this.isTopAtom ) {

      // move the atom's center position as the top book moves
      model.topBookPositionProperty.lazyLink( function( newPosition, oldPosition ) {
        if ( !self.isEvaporated ) {
          let deltaX = newPosition.x - oldPosition.x;
          let deltaY = newPosition.y - oldPosition.y;
          self.centerPosition.setXY( self.centerPosition.x + deltaX, self.centerPosition.y + deltaY );
        }
      } );
    }
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
      let evaporationDestinationX = this.model.width * ( phet.joist.random.nextBoolean() ? 1 : -1 );
      let evaporationDestinationY = this.positionProperty.get().y -
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
      this.centerPosition.set( this.initialPosition );
      this.isEvaporated = false;
    },

    /**
     * step the atom forward in time
     * @param dt - delta time, in seconds
     * @public
     */
    step: function( dt ) {

      // update the atom's position based on vibration and center position
      let newPosition = new Vector2(
        this.centerPosition.x + this.model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 ),
        this.centerPosition.y + this.model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 )
      );
      this.positionProperty.set( newPosition );

      // if evaporated, move away (but don't bother continuing once the atom is out of view)
      if ( this.isEvaporated && Math.abs( this.centerPosition.x ) < 4 * this.model.width ) {
        this.centerPosition.setXY(
          this.centerPosition.x + this.evaporationVelocity.x * dt,
          this.centerPosition.y + this.evaporationVelocity.y * dt
        );
      }
    }
  } );
} );