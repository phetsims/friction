// Copyright 2018-2021, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { FocusHighlightPath } from '../../../../scenery/js/imports.js';
import friction from '../../friction.js';

/**
 *
 * @param {Object} [options]
 * @constructor
 */
class CueArrow extends ArrowNode {
  constructor( options ) {

    // these values were empirically determined based on visual appearance
    options = merge( {
      headHeight: 32,
      headWidth: 30,
      tailWidth: 15,
      stroke: 'black',
      fill: FocusHighlightPath.INNER_FOCUS_COLOR,
      lineWidth: 2,
      arrowLength: 70
    }, options );

    super( 0, 0, options.arrowLength, 0, options );
  }
}

friction.register( 'CueArrow', CueArrow );
export default CueArrow;