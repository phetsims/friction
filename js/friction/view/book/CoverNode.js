// Copyright 2013-2021, University of Colorado Boulder

/**
 * Container for cover of book.  Only used in BookNode.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../../kite/js/Shape.js';
import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import Path from '../../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import friction from '../../../friction.js';
import FrictionConstants from '../../FrictionConstants.js';

// constants
const FONT = new PhetFont( 22 );
const WIDTH = 200;
const HEIGHT = 30;
const ROUND = 5;
const PAGES = 8;
const LENGTH = 75;
const ANGLE = Math.PI / 12;

class CoverNode extends Node {

  /**
   * @param {string} title
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( title, tandem, options ) {

    options = merge( {
      stroke: 'gray',
      color: 'black'
    }, options );

    super( { x: options.x, y: options.y } );

    // add white background for pages
    this.addChild( new Path( new Shape()
      .moveTo( WIDTH, 0 )
      .lineTo( WIDTH + Math.cos( ANGLE ) * LENGTH, -Math.sin( ANGLE ) * LENGTH )
      .lineTo( WIDTH + Math.cos( ANGLE ) * LENGTH, HEIGHT + 2 - Math.sin( ANGLE ) * LENGTH - 2 )
      .lineTo( WIDTH, HEIGHT - 1 ), {
      fill: 'white'
    } ) );

    const rightSideOfSpine = WIDTH - ROUND / 2 + Math.cos( ANGLE ) * LENGTH; // TODO: what are you!?!?!

    // add last page
    this.addChild( new Path( new Shape()
      .moveTo( WIDTH - ROUND / 2, HEIGHT )
      .lineTo( rightSideOfSpine, HEIGHT - Math.sin( ANGLE ) * LENGTH ), {
      stroke: options.stroke,
      lineWidth: 1,
      pickable: false
    } ) );

    // add front cover
    this.addChild( new Path( new Shape()
      .moveTo( ROUND / 2, 0 )
      .lineTo( ROUND / 2 + Math.cos( ANGLE ) * LENGTH, -Math.sin( ANGLE ) * LENGTH )
      .lineTo( rightSideOfSpine, -Math.sin( ANGLE ) * LENGTH )
      .lineTo( WIDTH - ROUND / 2, 0 ), {
      stroke: options.stroke,
      lineWidth: 1,
      fill: options.color
    } ) );

    // add binding, scaling the title to fit if necessary
    const bindingRectangle = new Rectangle( 0, 0, WIDTH, HEIGHT, ROUND, ROUND, {
      fill: options.color,
      stroke: options.stroke
    } );
    this.addChild( bindingRectangle );

    const titleText = new Text( title, {
      font: FONT,
      fill: FrictionConstants.BOOK_TEXT_COLOR,
      pickable: false,
      maxWidth: WIDTH * 0.97, // for a bit of margin
      tandem: tandem.createTandem( 'titleText' )
    } );
    titleText.center = bindingRectangle.center;

    // If updated via PhET-iO, recenter it
    titleText.textProperty.lazyLink( () => {
      titleText.center = bindingRectangle.center;
    } );
    this.addChild( titleText );


    // add remaining pages
    for ( let i = 0, dy = ( HEIGHT - ROUND ) / PAGES, dl = LENGTH / 5, offset = 5; i < PAGES; i++ ) {
      const amplitude = ( LENGTH - offset + dl * ( Math.pow( 1 / 2 - i / PAGES, 2 ) - 1 / 4 ) );
      const x2 = WIDTH + ROUND / 2 + Math.cos( ANGLE ) * amplitude;
      const y2 = ROUND / 2 + dy * i - Math.sin( ANGLE ) * amplitude;
      this.addChild( new Path( new Shape()
          .moveTo( WIDTH + ROUND / 2, ROUND / 2 + dy * i )
          .lineTo( x2, y2 ), {
          stroke: 'gray',
          pickable: false
        }
      ) );
    }
  }
}

friction.register( 'CoverNode', CoverNode );

export default CoverNode;