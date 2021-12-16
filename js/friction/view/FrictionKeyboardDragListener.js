// Copyright 2017-2021, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { KeyboardDragListener } from '../../../../scenery/js/imports.js';
import friction from '../../friction.js';
import FrictionModel from '../model/FrictionModel.js';

class FrictionKeyboardDragListener extends KeyboardDragListener {
  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   */
  constructor( model, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter ) {

    super( {
      start: () => {
        temperatureIncreasingAlerter.startDrag();
        temperatureDecreasingAlerter.startDrag();
      },
      drag: vectorDelta => model.move( vectorDelta ),
      end: event => {
        model.bottomOffsetProperty.set( 0 );

        temperatureIncreasingAlerter.endDrag();
        bookMovementAlerter.endDrag( event.domEvent );

      },
      dragBoundsProperty: new Property( FrictionModel.MAGNIFIED_DRAG_BOUNDS )
    } );
  }
}

friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

export default FrictionKeyboardDragListener;