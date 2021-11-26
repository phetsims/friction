// Copyright 2016-2021, University of Colorado Boulder

/**
 * This is an optimization that uses a CanvasNode to draw the atoms.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ShadedSphereNode from '../../../../../scenery-phet/js/ShadedSphereNode.js';
import { CanvasNode } from '../../../../../scenery/js/imports.js';
import friction from '../../../friction.js';
import FrictionConstants from '../../FrictionConstants.js';

// constants
const PARTICLE_IMAGE_SIZE = 32; // pixels, square
const ATOM_NODE_LINE_WIDTH = 2;
const HIGHLIGHT_FACTOR = 0.7;
const ATOM_STROKE = 'black';

// image size - this is tweaked slightly to account for stroke and to get behavior that is consistent with
// previous versions of the sim
const PARTICLE_IMAGE_SIZE_FOR_RENDERING = FrictionConstants.ATOM_RADIUS * 2 * 1.2;
const PARTICLE_RENDERING_OFFSET = -PARTICLE_IMAGE_SIZE_FOR_RENDERING / 2;

class AtomCanvasNode extends CanvasNode {

  /**
   * @param {Atom[]} atoms
   * @param {Object} [options]
   */
  constructor( atoms, options ) {

    super( options );

    // create the Scenery image nodes that will be drawn onto the canvas in order to render the atoms
    const topBookAtomNode = new ShadedSphereNode( PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.TOP_BOOK_ATOMS_COLOR.colorUtilsBrighter( HIGHLIGHT_FACTOR ),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    } );
    topBookAtomNode.toCanvas( image => {
      this.topBookAtomImage = image;
    } );

    const bottomBookAtomNode = new ShadedSphereNode( PARTICLE_IMAGE_SIZE, {
      mainColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR,
      highlightColor: FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR.colorUtilsBrighter( HIGHLIGHT_FACTOR ),
      stroke: ATOM_STROKE,
      lineWidth: ATOM_NODE_LINE_WIDTH
    } );
    bottomBookAtomNode.toCanvas( image => {
      this.bottomBookAtomImage = image;
    } );

    // @private {Atom[]} - array that holds the atoms to be rendered
    this.atoms = atoms;

    // @private - reusable position values, saves memory allocations
    this.axomPositionX = 0;
    this.atomPositionY = 0;
  }

  /**
   * @override
   * @protected
   * paints the particles on the canvas node
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas( context ) {

    // render each of the atoms to the canvas
    for ( let i = 0; i < this.atoms.length; i++ ) {
      const atom = this.atoms[ i ];
      const atomPosition = atom.positionProperty.get();
      const sourceImage = atom.isTopAtom ? this.topBookAtomImage : this.bottomBookAtomImage;
      context.drawImage(
        sourceImage,
        atomPosition.x + PARTICLE_RENDERING_OFFSET,
        atomPosition.y + PARTICLE_RENDERING_OFFSET,
        PARTICLE_IMAGE_SIZE_FOR_RENDERING,
        PARTICLE_IMAGE_SIZE_FOR_RENDERING
      );
    }
  }
}

friction.register( 'AtomCanvasNode', AtomCanvasNode );

export default AtomCanvasNode;