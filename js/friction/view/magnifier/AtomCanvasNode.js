// Copyright 2016-2018, University of Colorado Boulder

/**
 * This is an optimization that uses a CanvasNode to draw the atoms.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ShadedSphereNode = require( 'SCENERY_PHET/ShadedSphereNode' );

  // constants
  var PARTICLE_IMAGE_SIZE = 32; // pixels, square
  var ATOM_NODE_LINE_WIDTH = 2;
  var HIGHLIGHT_FACTOR = 0.7;
  var ATOM_STROKE = 'black';

  /**
   * @param {Object} [options]
   * @constructor
   */
  function AtomCanvasNode( options ) {

    var self = this;
    CanvasNode.call( this, options );

    // create the images that will be used to render the atoms

    var topBookAtomNode = new ShadedSphereNode( PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR.colorUtilsBrighter( HIGHLIGHT_FACTOR ),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    } );
    topBookAtomNode.toCanvas( function( image ) {
      self.topBookAtomImage = image;
    } );

    var bottomBookAtomNode = new ShadedSphereNode( PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR.colorUtilsBrighter( HIGHLIGHT_FACTOR ),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    } );
    bottomBookAtomNode.toCanvas( function( image ) {
      self.bottomBookAtomImage = image;
    } );

    // @private {Atom[]} - array that holds the atoms to be rendered
    this.atoms = [];
  }

  friction.register( 'AtomCanvasNode', AtomCanvasNode );

  return inherit( CanvasNode, AtomCanvasNode, {

    /**
     * paints the particles on the canvas node
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {

      // image size - this is tweaked slightly to account for stroke and to get behavior that is consistent with
      // previous versions of the sim
      var particleImageSize = FrictionConstants.ATOM_RADIUS * 2 * 1.2;

      // render each of the atoms on the canvas
      for ( var i = 0; i < this.atoms.length; i++ ) {
        var atom = this.atoms[ i ];
        var sourceImage = atom.isTopAtom ? this.topBookAtomImage : this.bottomBookAtomImage;
        context.drawImage(
          sourceImage,
          atom.positionProperty.get().x - particleImageSize / 2,
          atom.positionProperty.get().y - particleImageSize / 2,
          particleImageSize,
          particleImageSize
        );
      }
    },

    /**
     * add a reference to an atom model
     * @param {Atom} atom
     * @public
     */
    registerAtom: function( atom ) {
      this.atoms.push( atom );
    }
  } );
} );