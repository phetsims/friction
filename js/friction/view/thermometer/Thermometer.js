// Copyright 2002-2013, University of Colorado Boulder

/**
 * Container for thermometer
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );

  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  function Thermometer( temperatureProperty, range, options ) {
    var self = this,
      node = new Node(),
      height = options.height,
      liquidColor = 'rgb(237,28,36)',
      radius = 12,
      dTick = options.dTick,
      h;

    Node.call( this, { x: options.x, y: options.y } );

    // add background
    this.addChild( new Rectangle( -radius / 2, -height, radius, height, radius / 2, radius / 2, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1
    } ) );

    // add level rectangle
    this.rect = new Rectangle( -radius / 2 + 1, radius / 2, radius - 2, height, {
      fill: liquidColor
    } );
    this.rect.rotate( Math.PI );
    node.addChild( this.rect );
    node.setClipArea( new Shape().roundRect( -radius / 2, -height, radius, height, radius / 2, radius / 2 ) );
    this.addChild( node );

    // add flare
    this.addChild( new Rectangle( -radius / 2, -height, radius, height, radius / 2, radius / 2, {
      fill: new LinearGradient( -2, 0, 5, 0 )
        .addColorStop( 0, "rgba(255,255,255,0)" )
        .addColorStop( 0.5, "rgba(255,255,255,0.6)" )
        .addColorStop( 1, "rgba(255,255,255,0)" )
    } ) );

    // add ticks
    for ( h = -2 * dTick; h > -height + radius / 2; h -= dTick ) {
      this.addChild( new Path( new Shape()
          .moveTo( -radius / 2, h )
          .lineTo( -radius / 6, h ), { stroke: 'black', lineWidth: 1 } )
      );
    }

    // add red circle for liquid inside the bulb
    this.addChild( new Circle( radius, {
      fill: new RadialGradient( radius * 0.3, -radius * 0.3, 1, radius * 0.3, -radius * 0.3, radius / 1.5 )
        .addColorStop( 0, '#fff' )
        .addColorStop( 1, liquidColor )
    } ) );

    // Add outline for the bulb
    var bulbShape = Shape.arc( 0, 0, radius, -1.05, Math.PI + 1.05, false );
    this.addChild( new Path( bulbShape, {
      stroke: 'black',
      lineWidth: 1
    } ) );

    // add observer
    temperatureProperty.link( function( amplitude ) {
      self.rect.setRectHeight( height * ((amplitude - range.min) / range.max) );
    } );
  }

  return inherit( Node, Thermometer );
} );