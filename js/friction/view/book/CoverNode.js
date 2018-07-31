// Copyright 2013-2018, University of Colorado Boulder

/**
 * Container for cover of book.  Only used in BookNode.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  let FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  let inherit = require( 'PHET_CORE/inherit' );
  let Node = require( 'SCENERY/nodes/Node' );
  let Path = require( 'SCENERY/nodes/Path' );
  let PhetFont = require( 'SCENERY_PHET/PhetFont' );
  let Rectangle = require( 'SCENERY/nodes/Rectangle' );
  let Shape = require( 'KITE/Shape' );
  let Text = require( 'SCENERY/nodes/Text' );
  let friction = require( 'FRICTION/friction' );

  // constants
  let FONT = new PhetFont( 22 );
  let WIDTH = 200;
  let HEIGHT = 30;
  let ROUND = 5;
  let PAGES = 8;
  let LENGTH = 75;
  let ANGLE = Math.PI / 12;

  /**
   * @param {string} title
   * @param {Object} options
   * @constructor
   */
  function CoverNode( title, options ) {

    options = _.extend( {
      stroke: 'gray',
      color: 'black'
    }, options );

    Node.call( this, { x: options.x, y: options.y } );

    // add last page
    this.addChild( new Path( new Shape()
      .moveTo( WIDTH - ROUND / 2, HEIGHT )
      .lineTo( ( WIDTH - ROUND / 2 ) + Math.cos( ANGLE ) * LENGTH, HEIGHT - Math.sin( ANGLE ) * LENGTH ), {
      stroke: options.stroke,
      lineWidth: 1,
      pickable: false
    } ) );

    // add front cover
    this.addChild( new Path( new Shape()
      .moveTo( ROUND / 2, 0 )
      .lineTo( ROUND / 2 + Math.cos( ANGLE ) * LENGTH, -Math.sin( ANGLE ) * LENGTH )
      .lineTo( WIDTH - ROUND / 2 + Math.cos( ANGLE ) * LENGTH, -Math.sin( ANGLE ) * LENGTH )
      .lineTo( WIDTH - ROUND / 2, 0 ), {
      stroke: options.stroke,
      lineWidth: 1,
      fill: options.color
    } ) );

    // add binding, scaling the title to fit if necessary
    this.addChild( new Rectangle( 0, 0, WIDTH, HEIGHT, ROUND, ROUND, {
      fill: options.color,
      stroke: options.stroke
    } ) );
    let titleNode = new Text( title, {
      font: FONT,
      fill: FrictionConstants.BOOK_TEXT_COLOR,
      pickable: false
    } );
    titleNode.scale( Math.min( ( WIDTH * 0.9 ) / titleNode.width, 1 ) );
    titleNode.centerY = HEIGHT / 2;
    titleNode.centerX = WIDTH / 2;
    this.addChild( titleNode );

    // add white background for pages
    this.addChild( new Path( new Shape()
      .moveTo( WIDTH, 0 )
      .lineTo( WIDTH + Math.cos( ANGLE ) * LENGTH, -Math.sin( ANGLE ) * LENGTH )
      .lineTo( WIDTH + Math.cos( ANGLE ) * LENGTH, HEIGHT - Math.sin( ANGLE ) * LENGTH - 2 )
      .lineTo( WIDTH, HEIGHT - 2 ), {
      fill: 'white'
    } ) );

    // add remaining pages
    for ( let i = 0, dy = ( HEIGHT - ROUND ) / PAGES, dl = LENGTH / 5, offset = 5; i < PAGES; i++ ) {
      let amplitude = ( LENGTH - offset + dl * ( Math.pow( 1 / 2 - i / PAGES, 2 ) - 1 / 4 ) );
      let x2 = WIDTH + ROUND / 2 + Math.cos( ANGLE ) * amplitude;
      let y2 = ROUND / 2 + dy * i - Math.sin( ANGLE ) * amplitude;
      this.addChild( new Path( new Shape()
          .moveTo( WIDTH + ROUND / 2, ROUND / 2 + dy * i )
          .lineTo( x2, y2 ), {
          stroke: 'gray',
          pickable: false
        }
      ) );
    }
  }

  friction.register( 'CoverNode', CoverNode );

  return inherit( Node, CoverNode );
} );