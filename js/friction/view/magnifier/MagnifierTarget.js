// Copyright 2002-2013, University of Colorado Boulder

/**
 * view for magnifier's target
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

  function MagnifierTarget( options ) {
    Node.call( this );
    this.param = options;

    this.magRect = new Rectangle( 0, 0, options.width, options.height, options.round, options.round, { stroke: 'red', lineWidth: 1 } );
    this.addChild( this.magRect );
    this.pathLeft = new Path( new Shape(), { stroke: 'red', lineDash: [ 10, 10 ] } );
    this.addChild( this.pathLeft );
    this.pathRight = new Path( new Shape(), { stroke: 'red', lineDash: [ 10, 10 ] } );
    this.addChild( this.pathRight );
    this.set( options.x, options.y );
  }

  return inherit( Node, MagnifierTarget, {
    set: function( x, y ) {
      this.pathLeft.setShape( new Shape()
        .moveTo( this.param.leftAnchor.x, this.param.leftAnchor.y )
        .lineTo( x - this.param.width / 2, y ) );

      this.pathRight.setShape( new Shape()
        .moveTo( this.param.rightAnchor.x, this.param.rightAnchor.y )
        .lineTo( x + this.param.width / 2, y ) );

      this.magRect.setTranslation( x - this.param.width / 2, y - this.param.height / 2 );
    }
  } );
} );