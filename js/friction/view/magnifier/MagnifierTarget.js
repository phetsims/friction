// Copyright 2013-2018, University of Colorado Boulder

/**
 * view for magnifier's target, this includes the dashed traces up to the magnified view
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  var friction = require( 'FRICTION/friction' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number} round
   * @param {Vector2} leftAnchor - point on the magnifier to draw the left dashed line to
   * @param {Vector2} rightAnchor - point on the magnifier to draw the right dashed line to
   * @param {Object} [options]
   * @constructor
   */
  function MagnifierTarget( x, y, width, height, round, leftAnchor, rightAnchor, options ) {

    options = _.extend( {
      stroke: 'black'
    }, options );

    Node.call( this );

    this.targetWidth = width;
    this.targetHeight = height;
    this.leftAnchor = leftAnchor;
    this.rightAnchor = rightAnchor;

    this.magRect = new Rectangle( 0, 0, width, height, round, round, { stroke: options.stroke, lineWidth: 1 } );
    this.addChild( this.magRect );
    this.pathLeft = new Path( new Shape(), { stroke: options.stroke, lineDash: [ 10, 10 ] } );
    this.addChild( this.pathLeft );
    this.pathRight = new Path( new Shape(), { stroke: options.stroke, lineDash: [ 10, 10 ] } );
    this.addChild( this.pathRight );
    this.set( x, y );
  }

  friction.register( 'MagnifierTarget', MagnifierTarget );

  return inherit( Node, MagnifierTarget, {
    set: function( x, y ) {
      this.pathLeft.setShape( new Shape()
        .moveTo( this.leftAnchor.x, this.leftAnchor.y )
        .lineTo( x - this.targetWidth / 2, y ) );

      this.pathRight.setShape( new Shape()
        .moveTo( this.rightAnchor.x, this.rightAnchor.y )
        .lineTo( x + this.targetWidth / 2, y ) );

      this.magRect.setTranslation( x - this.targetWidth / 2, y - this.targetHeight / 2 );
    }
  } );
} );