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
    var self = this, radius = model.atoms.radius;
    this.x0 = options.x;
    this.y0 = options.y;
    Node.call( this, {x: this.x0, y: this.y0} );

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
      self.x = self.x0 + model.amplitude * (Math.random() - 0.5);
      self.y = self.y0 + model.amplitude * (Math.random() - 0.5);
    } );
  }

  inherit( Node, Atom );

  Atom.prototype.evaporate = function() {

  };

  return Atom;
} );