// Copyright 2013-2020, University of Colorado Boulder

/**
 * Model for a single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import friction from '../../friction.js';

// constants
const EVAPORATED_SPEED = 400; // speed that particles travel during evaporation, in model units per second

class Atom {

  /**
   * @param {Vector2} initialPosition
   * @param {FrictionModel} model
   * @param {boolean} isTopAtom
   */
  constructor( initialPosition, model, isTopAtom ) {

    // @private {Vector2} - initial position, used during resets
    this.initialPosition = initialPosition;

    // @private {FrictionModel}
    this.model = model;

    // @public (read-only) {boolean} - flag that indicates whether this atom is part of the top book
    this.isTopAtom = isTopAtom;

    // @private - marked as true when the atom is evaporated
    this.isEvaporated = false;

    // @public - the position of the atom
    this.positionProperty = new Vector2Property( initialPosition );

    // @private {Vector2} - the center position, around which oscillations occur
    this.centerPosition = new Vector2( initialPosition.x, initialPosition.y );

    // @private {Vector2} - velocity vector for evaporation
    this.evaporationVelocity = new Vector2( 0, 0 );

    if ( this.isTopAtom ) {

      // move the atom's center position as the top book moves
      model.topBookPositionProperty.lazyLink( ( newPosition, oldPosition ) => {
        if ( !this.isEvaporated ) {
          const deltaX = newPosition.x - oldPosition.x;
          const deltaY = newPosition.y - oldPosition.y;
          this.centerPosition.setXY( this.centerPosition.x + deltaX, this.centerPosition.y + deltaY );
        }
      } );
    }
  }

  /**
   * when the oscillation has exceeded the threshold, the atom breaks off, animates to one side of the screen, and
   * disappears
   * @public
   */
  evaporate() {
    assert && assert( !this.isEvaporated, 'Atom was already evaporated' );

    this.isEvaporated = true;
    const evaporationDestinationX = this.model.width * ( dotRandom.nextBoolean() ? 1 : -1 );
    const evaporationDestinationY = this.positionProperty.get().y -
                                    this.model.distanceBetweenBooksProperty.get() * dotRandom.nextDouble();

    this.evaporationVelocity.setXY(
      evaporationDestinationX - this.positionProperty.get().x,
      evaporationDestinationY - this.positionProperty.get().y
    ).setMagnitude( EVAPORATED_SPEED );
  }

  /**
   * restore the initial conditions
   * @public
   */
  reset() {
    this.centerPosition.set( this.initialPosition );
    this.isEvaporated = false;
  }

  /**
   * step the atom forward in time
   * @param dt - delta time, in seconds
   * @public
   */
  step( dt ) {

    // update the atom's position based on vibration and center position
    const newPosition = new Vector2(
      this.centerPosition.x + this.model.vibrationAmplitudeProperty.get() * ( dotRandom.nextDouble() - 0.5 ),
      this.centerPosition.y + this.model.vibrationAmplitudeProperty.get() * ( dotRandom.nextDouble() - 0.5 )
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
}

friction.register( 'Atom', Atom );

export default Atom;