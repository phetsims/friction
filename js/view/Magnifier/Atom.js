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
    var self = this, radius = model.atoms.radius, x0 = options.x, y0 = options.y;
    Node.call( this, {x: x0, y: y0} );

    // add view
    this.view = new Circle( radius, {
      fill: new RadialGradient( radius * 0.3, -radius * 0.3, 1, radius * 0.3, -radius * 0.3, radius / 1.5 )
        .addColorStop( 0, '#fff' )
        .addColorStop( 1, options.color ),
      stroke: 'black',
      lineWidth: 1
    } );

    this.addChild( this.view );

    model.newStepProperty.link( function() {
      self.x = x0 + model.amplitude * (Math.random() - 0.5);
      self.y = y0 + model.amplitude * (Math.random() - 0.5);
    } );
  }

  inherit( Node, Atom );

  return Atom;
} );