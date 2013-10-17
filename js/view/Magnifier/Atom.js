/**
 * Copyright 2002-2013, University of Colorado
 * view for single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 */


define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );

  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Circle = require( 'SCENERY/nodes/Circle' );

  function Atom( model, options ) {
    var radius = options.radius;
    Node.call( this, {x: options.x, y: options.y} );

    // add view
    this.view = new Circle( radius, {
      fill: new RadialGradient( radius * 0.3, -radius * 0.3, 1, radius * 0.3, -radius * 0.3, radius / 1.5 )
        .addColorStop( 0, '#fff' )
        .addColorStop( 1, options.color ),
      stroke: 'black',
      lineWidth: 1
    } );

    this.addChild( this.view );
  }

  inherit( Node, Atom );

  return Atom;
} );