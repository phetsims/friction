// Copyright 2016, University of Colorado Boulder

/**
 * This is an optimization that uses a CanvasNode to draw the atoms.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var friction = require( 'FRICTION/friction' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var PARTICLE_IMAGE_SIZE = 32; // pixels, square

  /**
   * @param {Property.<Vector2>} topPositionProperty
   * @param {object} options
   * @constructor
   */
  function AtomCanvasNode( topPositionProperty, options ) {

    CanvasNode.call( this, options );

    // Property[Vector2] that holds the translation of the top book
    this.topPositionProperty = topPositionProperty;

    // create a canvas and render the particle images that will be used
    this.particleImageCanvas = document.createElement( 'canvas' );
    this.particleImageCanvas.width = PARTICLE_IMAGE_SIZE * 2; // wide enough to accommodate two particles
    this.particleImageCanvas.height = PARTICLE_IMAGE_SIZE;

    // the particle radius must be a little smaller than half the image to allow space for the stroke
    var particleImageRadius = PARTICLE_IMAGE_SIZE * 0.47;

    // draw the circle that will be used for atoms in the top book onto the canvas
    var context = this.particleImageCanvas.getContext( '2d' );
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.fillStyle = FrictionSharedConstants.TOP_BOOK_ATOMS_COLOR;
    context.beginPath();
    context.arc(
      PARTICLE_IMAGE_SIZE / 2,
      PARTICLE_IMAGE_SIZE / 2,
      particleImageRadius,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();

    // draw the circle that will be used for atoms in the bottom book onto the canvas
    context.fillStyle = 'rgb( 0, 251, 50 )';
    context.beginPath();
    context.arc(
      PARTICLE_IMAGE_SIZE * 1.5,
      PARTICLE_IMAGE_SIZE / 2,
      particleImageRadius,
      0,
      Math.PI * 2
    );
    context.fill();
    context.stroke();

    // add the highlights for both atom images
    context.beginPath();
    context.fillStyle = 'white';
    context.arc(
      PARTICLE_IMAGE_SIZE * 0.65,
      PARTICLE_IMAGE_SIZE * 0.35,
      PARTICLE_IMAGE_SIZE * 0.12,
      0,
      Math.PI * 2
    );
    context.fill();
    context.beginPath();
    context.arc(
      PARTICLE_IMAGE_SIZE * 1.65,
      PARTICLE_IMAGE_SIZE * 0.35,
      PARTICLE_IMAGE_SIZE * 0.12,
      0,
      Math.PI * 2
    );
    context.fill();

    // array that holds the Atom views
    this.atoms = [];

    // pre-allocated vector, improves performance
    this.particleImagePosition = new Vector2();
  }

  friction.register( 'AtomCanvasNode', AtomCanvasNode );
  
  return inherit( CanvasNode, AtomCanvasNode, {

    /**
     * paints the particles on the canvas node
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {

      // image width - this is tweaked slightly to account for stroke and to get behavior that is consistent with
      // previous versions of the sim
      var particleImageSize = FrictionSharedConstants.ATOM_RADIUS * 2 * 1.1;

      // render each of the atoms on the canvas
      for ( var i = 0; i < this.atoms.length; i++ ){
        var atom = this.atoms[ i ];
        this.particleImagePosition.x = atom.currentX - particleImageSize / 2;
        this.particleImagePosition.y = atom.currentY - particleImageSize / 2;
        context.drawImage(
          this.particleImageCanvas,
          atom.isTopAtom ? 0 : PARTICLE_IMAGE_SIZE,
          0,
          PARTICLE_IMAGE_SIZE,
          PARTICLE_IMAGE_SIZE,
          this.particleImagePosition.x,
          this.particleImagePosition.y,
          particleImageSize,
          particleImageSize
        );
      }
    },

    // when an Atom view is created, we want a reference so we can quickly scan a list of atoms
    registerAtom: function( atom ) {
      this.atoms.push( atom );
    }

  } );
} );
