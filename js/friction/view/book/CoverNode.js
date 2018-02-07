// Copyright 2013-2018, University of Colorado Boulder

/**
 * Container for cover of book.  Only used in BookNode.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var friction = require( 'FRICTION/friction' );

  // constants
  var FONT = new PhetFont( 22 );
  var WIDTH = 200;
  var HEIGHT = 30;
  var ROUND = 5;
  var PAGES = 8;
  var LENGTH = 75;
  var ANGLE = Math.PI / 12;

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} title
   * @param {Object} options
   * @constructor
   */
  function CoverNode( x, y, title, options ) {

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
    var titleNode = new Text( title, {
      font: FONT,
      fill: FrictionSharedConstants.BOOK_TEXT_COLOR,
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
    for ( var i = 0, dy = ( HEIGHT - ROUND ) / PAGES, dl = LENGTH / 5, offset = 5; i < PAGES; i++ ) {
      var x2 = WIDTH + ROUND / 2 + Math.cos( ANGLE ) * ( LENGTH - offset + dl * ( Math.pow( 1 / 2 - i / PAGES, 2 ) - 1 / 4 ) );
      var y2 = ROUND / 2 + dy * i - Math.sin( ANGLE ) * ( LENGTH - offset + dl * ( Math.pow( 1 / 2 - i / PAGES, 2 ) - 1 / 4 ) );
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