// Copyright 2002-2013, University of Colorado Boulder

/**
 * view for single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // Imports
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Vector2 = require( 'DOT/Vector2' );
  // var FrictionModel = require( 'model/FrictionModel' );

  /**
   * @param model
   * @param options
   * @constructor
   */
  function Atom( model, options ) {
    var self = this,
      radius = model.atoms.radius;

    // flag records whether we are on the top (yellow) book
    this.isTopAtom = options.color === 'rgb( 255, 255, 0 )';
    this.currentX = 0;
    this.currentY = 0;
    this.x0 = options.x;
    this.y0 = options.y;
    this.model = model;
    this.options = options;
    Node.call( this, { x: this.x0, y: this.y0 } );

    // function for creating or obtaining atom graphic for a given color
    if ( !Atom.atomGraphics[options.color] ) {
      var scale = Atom.imageScale; // Scale up before rasterization so it won't be too pixellated/fuzzy, value empirically determined.
      var container = new Node( { scale: 1 / scale } );
      var atomNode = new Circle( radius, { fill: options.color, stroke: 'black', lineWidth: 1, scale: scale } );
      atomNode.addChild( new Circle( radius * 0.3, {fill: 'white', x: radius * 0.3, y: -radius * 0.3} ) );
      var image = atomNode.toImage( function( img, x, y ) {
        // add our actual HTMLImageElement to atomImages
        Atom.atomImages[self.isTopAtom] = img;
        Atom.atomOffset = new Vector2( -x, -y );
        
        // add a node with that image to our container (part of atomGraphics)
        container.addChild( new Node( { children: [
          new Image( img, { x: -x, y: -y } )
        ] } ) );
      } );
      Atom.atomGraphics[options.color] = container;
    }
    this.addChild( Atom.atomGraphics[options.color] );

    model.newStepProperty.link( function() {
      self.currentX = self.x0 + model.amplitude * (Math.random() - 0.5);
      self.currentY = self.y0 + model.amplitude * (Math.random() - 0.5);
      // self.setTranslation( self.x0 + model.amplitude * (Math.random() - 0.5), self.y0 + model.amplitude * (Math.random() - 0.5) );
    } );
  }
  
  // export information needed to directly render the images
  Atom.imageScale = 3;
  Atom.atomGraphics = {};
  Atom.atomImages = {};
  Atom.atomOffset = null; // NOTE: this is OK for now because the atoms are the same size, and the toImage'd images should have the exact same offsets

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
} )
;
