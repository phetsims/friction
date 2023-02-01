// Copyright 2013-2023, University of Colorado Boulder

/**
 * Container for cover of book.  Only used in BookNode.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Rectangle, Text } from '../../../../../scenery/js/imports.js';
import friction from '../../../friction.js';
import FrictionConstants from '../../FrictionConstants.js';

// constants
const FONT = new PhetFont( 22 );
const BINDING_LENGTH = 200; // dimension of the binding inline with the text of the book.
const BINDING_WIDTH = 30; // thickness of the book
const ROUND = 5;
const PAGES = 8;
const BOOK_COVER_WIDTH = 75; // How "wide" the book is, if you were looking at the cover of a book, the width of it.
const ANGLE = Math.PI / 12;

class CoverNode extends Node {

  /**
   * @param {string} title
   * @param {Tandem} tandemParent - not passed to Node and instrumented!
   * @param {Object} [options]
   */
  constructor( title, tandemParent, options ) {

    options = merge( {
      stroke: 'gray',
      color: 'black'
    }, options );

    super( { x: options.x, y: options.y } );

    // add white background for pages
    this.addChild( new Path( new Shape()
      .moveTo( BINDING_LENGTH, 0 )
      .lineTo( BINDING_LENGTH + Math.cos( ANGLE ) * BOOK_COVER_WIDTH, -Math.sin( ANGLE ) * BOOK_COVER_WIDTH )
      .lineTo( BINDING_LENGTH + Math.cos( ANGLE ) * BOOK_COVER_WIDTH, BINDING_WIDTH + 2 - Math.sin( ANGLE ) * BOOK_COVER_WIDTH - 2 )
      .lineTo( BINDING_LENGTH, BINDING_WIDTH - 1 ), {
      fill: 'white'
    } ) );

    const rightSideOfSpine = BINDING_LENGTH - ROUND / 2 + Math.cos( ANGLE ) * BOOK_COVER_WIDTH;

    // add last page
    this.addChild( new Path( new Shape()
      .moveTo( BINDING_LENGTH - ROUND / 2, BINDING_WIDTH )
      .lineTo( rightSideOfSpine, BINDING_WIDTH - Math.sin( ANGLE ) * BOOK_COVER_WIDTH ), {
      stroke: options.stroke,
      lineWidth: 1,
      pickable: false
    } ) );

    // add front cover
    this.addChild( new Path( new Shape()
      .moveTo( ROUND / 2, 0 )
      .lineTo( ROUND / 2 + Math.cos( ANGLE ) * BOOK_COVER_WIDTH, -Math.sin( ANGLE ) * BOOK_COVER_WIDTH )
      .lineTo( rightSideOfSpine, -Math.sin( ANGLE ) * BOOK_COVER_WIDTH )
      .lineTo( BINDING_LENGTH - ROUND / 2, 0 ), {
      stroke: options.stroke,
      lineWidth: 1,
      fill: options.color
    } ) );

    // add binding, scaling the title to fit if necessary
    const bindingRectangle = new Rectangle( 0, 0, BINDING_LENGTH, BINDING_WIDTH, ROUND, ROUND, {
      fill: options.color,
      stroke: options.stroke
    } );
    this.addChild( bindingRectangle );

    const titleText = new Text( title, {
      font: FONT,
      fill: FrictionConstants.BOOK_TEXT_COLOR,
      pickable: false,
      maxWidth: BINDING_LENGTH * 0.97, // for a bit of margin
      tandem: tandemParent.createTandem( 'titleText' ),
      boundsMethod: 'accurate'
    } );
    titleText.center = bindingRectangle.center;

    // If updated via PhET-iO, recenter it
    titleText.boundsProperty.lazyLink( () => {
      titleText.center = bindingRectangle.center;
    } );


    // add remaining pages
    for ( let i = 0, dy = ( BINDING_WIDTH - ROUND ) / PAGES, dl = BOOK_COVER_WIDTH / 5, offset = 5; i < PAGES; i++ ) {
      const amplitude = ( BOOK_COVER_WIDTH - offset + dl * ( Math.pow( 1 / 2 - i / PAGES, 2 ) - 1 / 4 ) );
      const x2 = BINDING_LENGTH + ROUND / 2 + Math.cos( ANGLE ) * amplitude;
      const y2 = ROUND / 2 + dy * i - Math.sin( ANGLE ) * amplitude;
      this.addChild( new Path( new Shape()
          .moveTo( BINDING_LENGTH + ROUND / 2, ROUND / 2 + dy * i )
          .lineTo( x2, y2 ), {
          stroke: 'gray',
          pickable: false
        }
      ) );
    }

    // Keep title on top, as a workaround for kn and km locales in https://github.com/phetsims/scenery/issues/1458
    this.addChild( titleText );
  }
}

friction.register( 'CoverNode', CoverNode );

export default CoverNode;