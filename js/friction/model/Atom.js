// Copyright 2013-2022, University of Colorado Boulder

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
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import friction from '../../friction.js';

// constants
const SHEAR_OFF_SPEED = 400; // speed that particles travel during shearing, in model units per second

let uniqueID = 0;

class Atom extends PhetioObject {

  /**
   * @param {Vector2} initialPosition
   * @param {FrictionModel} model
   * @param {boolean} isTopAtom
   * @param {Object} config
   */
  constructor( initialPosition, model, isTopAtom, config ) {

    required( config );
    assert && assert( !config.tandem, 'Atom sets its own tandem' );

    config = merge( {
      parentTandem: required( config.parentTandem ),
      tandem: Tandem.REQUIRED,
      phetioType: Atom.AtomIO
    }, config );

    config.tandem = config.parentTandem.createTandem( `atom${uniqueID}` );
    uniqueID++;

    super( config );

    // @private {Vector2} - initial position, used during resets
    this.initialPosition = initialPosition;

    // @private {FrictionModel}
    this.model = model;

    // @public (read-only) {boolean} - flag that indicates whether this atom is part of the top book
    this.isTopAtom = isTopAtom;

    // @private - marked as true when the atom is sheared off
    this.isShearedOff = false;

    // @public - the position of the atom
    this.positionProperty = new Vector2Property( initialPosition, {
      tandem: config.tandem.createTandem( 'positionProperty' ),
      phetioHighFrequency: true,
      phetioReadOnly: true
    } );

    // @private {Vector2} - the center position, around which oscillations occur
    this.centerPosition = new Vector2( initialPosition.x, initialPosition.y );

    // @private {Vector2} - velocity vector for shearing
    this.shearingVelocity = new Vector2( 0, 0 );

    if ( this.isTopAtom ) {

      // move the atom's center position as the top book moves
      model.topBookPositionProperty.lazyLink( ( newPosition, oldPosition ) => {
        if ( !this.isShearedOff && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
          const deltaX = newPosition.x - oldPosition.x;
          const deltaY = newPosition.y - oldPosition.y;
          this.centerPosition.setXY( this.centerPosition.x + deltaX, this.centerPosition.y + deltaY );
        }
      } );
    }
  }

  /**
   * when the oscillation has exceeded the threshold, the atom breaks off, animates to one side of the screen, and
   * disappears.
   * @public
   */
  shearOff() {
    assert && assert( !this.isShearedOff, 'Atom already sheared off' );

    this.isShearedOff = true;
    const shearingDestinationX = this.model.width * ( dotRandom.nextBoolean() ? 1 : -1 );
    const shearingDestinationY = this.positionProperty.get().y -
                                 this.model.distanceBetweenBooksProperty.get() * dotRandom.nextDouble();

    this.shearingVelocity.setXY(
      shearingDestinationX - this.positionProperty.get().x,
      shearingDestinationY - this.positionProperty.get().y
    ).setMagnitude( SHEAR_OFF_SPEED );
  }

  /**
   * restore the initial conditions
   * @public
   */
  reset() {
    this.centerPosition.set( this.initialPosition );
    this.isShearedOff = false;
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

    // if sheared off, move away (but don't bother continuing once the atom is out of view)
    if ( this.isShearedOff && Math.abs( this.centerPosition.x ) < 4 * this.model.width ) {
      this.centerPosition.setXY(
        this.centerPosition.x + this.shearingVelocity.x * dt,
        this.centerPosition.y + this.shearingVelocity.y * dt
      );
    }
  }
}


Atom.AtomIO = new IOType( 'AtomIO', {
  valueType: Atom,
  documentation: 'An atom on the book',
  stateSchema: {
    initialPosition: Vector2.Vector2IO,
    isTopAtom: BooleanIO,
    isShearedOff: BooleanIO,
    centerPosition: Vector2.Vector2IO,
    shearingVelocity: Vector2.Vector2IO
  }
} );

friction.register( 'Atom', Atom );

export default Atom;