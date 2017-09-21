// Copyright 2013-2017, University of Colorado Boulder

/**
 * Container for cover of book
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FONT = new PhetFont( 22 );
  var friction = require( 'FRICTION/friction' );

  function Cover( x, y, title, options ) {

    options = _.extend( {
      stroke: 'gray',
      color: 'black'
    }, options );

    var width = 200;
    var height = 30;
    var round = 5;
    var pages = 8;
    var length = 75;
    var angle = Math.PI / 12;

    Node.call( this, { x: x, y: y } );

    // add last page
    this.addChild( new Path( new Shape()
      .moveTo( width - round / 2, height )
      .lineTo( (width - round / 2) + Math.cos( angle ) * length, height - Math.sin( angle ) * length ),
      { stroke: options.stroke, lineWidth: 1, pickable: false } ) );

    // add front cover
    this.addChild( new Path( new Shape()
      .moveTo( round / 2, 0 )
      .lineTo( round / 2 + Math.cos( angle ) * length, -Math.sin( angle ) * length )
      .lineTo( width - round / 2 + Math.cos( angle ) * length, -Math.sin( angle ) * length )
      .lineTo( width - round / 2, 0 ),
      { stroke: options.stroke, lineWidth: 1, fill: options.color } ) );

    // add binding, scaling the title to fit if necessary
    this.addChild( new Rectangle( 0, 0, width, height, round, round, { fill: options.color, stroke: options.stroke } ) );
    var titleNode = new Text( title, {
      font: FONT,
      fill: 'black',
      pickable: false
    } );
    titleNode.scale( Math.min( ( width * 0.9 ) / titleNode.width, 1 ) );
    titleNode.centerY = height / 2;
    titleNode.centerX = width / 2;
    this.addChild( titleNode );

    // add white background for pages
    this.addChild( new Path( new Shape()
      .moveTo( width, 0 )
      .lineTo( width + Math.cos( angle ) * length, -Math.sin( angle ) * length )
      .lineTo( width + Math.cos( angle ) * length, height - Math.sin( angle ) * length - 2 )
      .lineTo( width, height - 2 ),
      { fill: 'white' } ) );

    // add remaining pages
    for ( var i = 0, dy = (height - round) / pages, dl = length / 5, offset = 5; i < pages; i++ ) {
      this.addChild( new Path( new Shape()
        .moveTo( width + round / 2, round / 2 + dy * i )
        .lineTo( width + round / 2 + Math.cos( angle ) * (length - offset + dl * (Math.pow( 1 / 2 - i / pages, 2 ) - 1 / 4)), round / 2 + dy * i - Math.sin( angle ) * (length - offset + dl * (Math.pow( 1 / 2 - i / pages, 2 ) - 1 / 4)) ),
        { stroke: 'gray', pickable: false }
      ) );
    }
  }

  friction.register( 'Cover', Cover );

  return inherit( Node, Cover );
} );