// Copyright 2017-2025, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifyingGlassNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import KeyboardDragListener from '../../../../scenery/js/listeners/KeyboardDragListener.js';
import friction from '../../friction.js';

class FrictionKeyboardDragListener extends KeyboardDragListener {

  /**
   * @param {FrictionModel} model
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param {Object} [options]
   */
  constructor( model, temperatureIncreasingAlerter,
               temperatureDecreasingAlerter, bookMovementAlerter,
               options ) {

    options = merge( {
      dragSpeed: 1000,
      shiftDragSpeed: 500,
      positionProperty: model.topBookPositionProperty,
      start: () => {
        temperatureIncreasingAlerter.startDrag();
        temperatureDecreasingAlerter.startDrag();
      },
      end: event => {

        temperatureIncreasingAlerter.endDrag();
        bookMovementAlerter.endDrag( event && event.domEvent );

      },
      dragBoundsProperty: model.topBookDragBoundsProperty
    }, options );

    super( options );
  }
}

friction.register( 'FrictionKeyboardDragListener', FrictionKeyboardDragListener );

export default FrictionKeyboardDragListener;