// Copyright 2002-2013, University of Colorado Boulder

/**
 * Container for cover of book
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );

  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FONT = new PhetFont( 22 );

  function Cover( options ) {
    var width = 200,
      height = 30,
      round = 5,
      pages = 8,
      length = 75,
      angle = Math.PI / 12;

    Node.call( this, { x: options.x, y: options.y } );

    // add last page
    this.addChild( new Path( new Shape()
        .moveTo( width - round / 2, height )
        .lineTo( (width - round / 2) + Math.cos( angle ) * length, height - Math.sin( angle ) * length ),
      { stroke: 'black', lineWidth: 1, pickable: false } ) );

    // add front cover
    this.addChild( new Path( new Shape()
        .moveTo( round / 2, 0 )
        .lineTo( round / 2 + Math.cos( angle ) * length, -Math.sin( angle ) * length )
        .lineTo( width - round / 2 + Math.cos( angle ) * length, -Math.sin( angle ) * length )
        .lineTo( width - round / 2, 0 ),
      { stroke: 'black', lineWidth: 1, fill: options.color } ) );

    // add binding
    this.addChild( new Rectangle( 0, 0, width, height, round, round, { fill: options.color, stroke: 'black' } ) );
    this.addChild( new Text( options.title, { centerY: height / 2, centerX: width / 2, font: FONT, fill: 'black', pickable: false } ) );

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

  return inherit( Node, Cover );
} );