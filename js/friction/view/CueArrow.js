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


  // constants
  let ARROW_LENGTH = 70;
  let INTER_ARROW_SPACING = 20;

  /**
   *
   * @param {Object} [options]
   * @constructor
   */
  class CueArrow extends ArrowNode {
    constructor( options ) {

      options = _.extend( {
        // these values were empirically determined based on visual appearance
        headHeight: 32,
        headWidth: 30,
        tailWidth: 15,
        fill: FocusHighlightPath.INNER_FOCUS_COLOR,
        stroke: 'black',
        lineWidth: 2,
        scale:.75
      }, options );

      super( INTER_ARROW_SPACING / 2, 0, ARROW_LENGTH, 0, options );
    }
  }

  return friction.register( 'CueArrow', CueArrow );
} );