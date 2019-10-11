// Copyright 2018, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  const friction = require( 'FRICTION/friction' );
  const merge = require( 'PHET_CORE/merge' );

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

  return friction.register( 'CueArrow', CueArrow );
} );