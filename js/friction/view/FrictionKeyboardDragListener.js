// Copyright 2017-2021, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import KeyboardDragListener from '../../../../scenery/js/listeners/KeyboardDragListener.js';
import friction from '../../friction.js';
import FrictionModel from '../model/FrictionModel.js';

class FrictionKeyboardDragListener extends KeyboardDragListener {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
   * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
   * @param {BookMovementDescriber} bookMovementDescriber
   */
  constructor( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber, bookMovementDescriber ) {

    let oldPositionValue; // determines our delta for how the positionProperty changed every drag

    super( {
      positionProperty: model.topBookPositionProperty,
      start: () => {
        oldPositionValue = model.topBookPositionProperty.get().copy();

        temperatureIncreasingDescriber.startDrag();
        temperatureDecreasingDescriber.startDrag();
      },
      drag: () => {
        const newValue = model.topBookPositionProperty.get();
        model.move( new Vector2( newValue.x - oldPositionValue.x, newValue.y - oldPositionValue.y ) );

        // update the oldPositionValue for the next onDrag
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },
      end: event => {
        model.bottomOffsetProperty.set( 0 );

        temperatureIncreasingDescriber.endDrag();
        bookMovementDescriber.endDrag( event.domEvent );

      },
      dragBounds: FrictionModel.MAGNIFIED_DRAG_BOUNDS
    } );
  }
}

friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

export default FrictionKeyboardDragListener;