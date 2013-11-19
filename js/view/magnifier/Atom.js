// Copyright 2002-2013, University of Colorado Boulder

/**
 * view for single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );

  var Circle = require( 'SCENERY/nodes/Circle' );

  function Atom( model, options ) {
    //REVIEW: Variable declarations should be on separate lines.
    var self = this,
      radius = model.atoms.radius;

    this.x0 = options.x;
    this.y0 = options.y;
    this.model = model;
    this.options = options;
    Node.call( this, {x: this.x0, y: this.y0} );

    // add view
    this.view = new Node( {children: [new Circle( radius, {
      fill: options.color,
      stroke: 'black',
      lineWidth: 1
    } ), new Circle( radius * 0.3, {fill: 'white', x: radius * 0.3, y: -radius * 0.3} )]} );

    this.addChild( this.view );

    model.newStepProperty.link( function() {
      self.setTranslation( self.x0 + model.amplitude * (Math.random() - 0.5), self.y0 + model.amplitude * (Math.random() - 0.5) );
    } );
  }

  //REVIEW: For consistency, please use the style where prototype functions
  // are added in the inherit statement, as was done in, say, FrictionModel.js.
  return inherit( Node, Atom, {
    evaporate: function() {
      var self = this,
        steps = 100,
        dx,
        dy;

      this.handler = function() {
        self.x0 += dx;
        self.y0 -= dy;
        if ( self.x0 > 4 * self.model.width ) {
          self.model.newStepProperty.unlink( self.handler );
          self.setVisible( false );
        }
      };

      this.x1 = this.x0 + 4 * this.model.width * (Math.round( Math.random() ) - 0.5);
      dx = (this.x1 - this.x0) / steps;
      this.y1 = this.y0 + Math.random() * 1.5 * this.getYrange();
      dy = (this.y1 - this.y0) / steps;
      this.model.newStepProperty.link( self.handler );
    },
    getYrange: function() {
      var model = this.model;
      return model.distance + model.atoms.dy * model.toEvaporate.length;
    },
    reset: function() {
      this.x0 = this.options.x;
      this.y0 = this.options.y;
      this.model.newStepProperty.unlink( this.handler );
      this.setVisible( true );
    }
  } );
} );