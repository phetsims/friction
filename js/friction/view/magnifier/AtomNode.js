// Copyright 2013-2018, University of Colorado Boulder

/**
 * Displays a single atom
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var STEPS = 250; // steps until atom has completed evaporation movement
  var IMAGE_SCALE = 3;
  var ATOM_NODES = {}; // key = {string} color, value = node

  /**
   * @param {FrictionModel} model
   * @param {Object} [options]
   * @constructor
   */
  function AtomNode( model, options ) {
    var self = this;
    var radius = model.atoms.radius;

    // @public (read-only) {boolean} flag records whether we are on the top book
    this.isTopAtom = options.color === FrictionConstants.TOP_BOOK_ATOMS_COLOR;

    // @private - marked as true when the atom is evaporated
    this.isEvaporated = false;

    // @public {number} - the x-position of the AtomNode
    this.positionX = 0;

    // @public {number} - the y-position of the AtomNode
    this.positionY = 0;

    // @private {number} - origin for oscillation
    this.originX = options.x;

    // @private {number} - origin for oscillation
    this.originY = options.y;

    // @private {FrictionModel} 
    this.model = model;

    // @private {number} initial coordinate for resetting
    this.initialX = options.x;

    // @private {number} initial coordinate for resetting
    this.initialY = options.y;

    Node.call( this, { x: this.originX, y: this.originY } );

    // function for creating or obtaining atom graphic for a given color
    if ( !ATOM_NODES[ options.color ] ) {

      // Scale up before rasterization so it won't be too pixellated/fuzzy, value empirically determined.
      var container = new Node( { scale: 1 / IMAGE_SCALE } );

      // TODO: should we use shaded sphere?
      var atomNode = new Circle( radius, { fill: options.color, stroke: 'black', lineWidth: 1, scale: IMAGE_SCALE } );
      atomNode.addChild( new Circle( radius * 0.3, { fill: 'white', x: radius * 0.3, y: -radius * 0.3 } ) );
      atomNode.toImage( function( img, x, y ) {

        // add a node with that image to our container
        container.addChild( new Node( {
          children: [
            new Image( img, { x: -x, y: -y } )
          ]
        } ) );
      } );
      ATOM_NODES[ options.color ] = container;
    }
    this.addChild( ATOM_NODES[ options.color ] );

    // move the atom as the top book moves if it is part of that book
    var motionVector = new Vector2(); // Optimization to minimize garbage collection.
    model.bookPositionProperty.lazyLink( function( newPosition, oldPosition ) {
      if ( self.isTopAtom && !self.isEvaporated ) {
        motionVector.set( newPosition );
        motionVector.subtract( oldPosition );
        self.originX = self.originX + motionVector.x;
        self.originY = self.originY + motionVector.y;
      }
    } );

    // update atom's position based on vibration and center position
    model.stepEmitter.addListener( function() {
      self.positionX = self.originX + model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 );
      self.positionY = self.originY + model.amplitudeProperty.get() * ( phet.joist.random.nextDouble() - 0.5 );
    } );
  }

  friction.register( 'AtomNode', AtomNode );

  return inherit( Node, AtomNode, {

    /**
     * TODO: visibility annotation and documentation
     */
    evaporate: function() {
      var self = this;

      this.isEvaporated = true;

      var evaporationDestinationX = this.originX + 4 * this.model.width * ( Util.roundSymmetric( phet.joist.random.nextDouble() ) - 0.5 );
      var dx = ( evaporationDestinationX - this.originX ) / STEPS;
      var evaporationDestinationY = this.originY + phet.joist.random.nextDouble() * 1.5 * this.getYrange();
      var dy = ( evaporationDestinationY - this.originY ) / STEPS;

      // create and attach the evaporation motion handler
      this.handler = function() {
        self.originX += dx;
        self.originY -= dy;

        // TODO: memory leak for atoms moving to the left?
        if ( self.originX > 4 * self.model.width ) {
          self.model.stepEmitter.removeListener( self.handler );
          self.setVisible( false );
        }
      };

      // TODO: why is this linking every time it evaporates?  Can it only evaporate once?
      // TODO: does this file need a dispose function?
      this.model.stepEmitter.addListener( self.handler );
    },

    /**
     * TODO: visibility annotation
     * @returns {number}
     */
    // TODO: fix casing on the name
    getYrange: function() {
      return this.model.distanceProperty.get() + this.model.atoms.distanceY * this.model.toEvaporate.length;
    },

    /**
     * @public
     */
    reset: function() {
      this.originX = this.initialX;
      this.originY = this.initialY;

      // handler may have been unlinked by itself (see above), so check that we're still registered
      if ( this.model.stepEmitter.hasListener( this.handler ) ) {
        this.model.stepEmitter.removeListener( this.handler );
      }
      this.setVisible( true );
      this.isEvaporated = false;
    }
  } );
} );
