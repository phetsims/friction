// Copyright 2002-2013, University of Colorado Boulder

/**
 * This is an optimization that uses a single HTML Canvas to draw the atoms.
 * It draws atoms on a single Canvas fitted to the area we need.
 *
 * @author Jonathan Olson / John Blanco
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var DOM = require( 'SCENERY/nodes/DOM' );
  var Util = require( 'SCENERY/util/Util' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Atom = require( 'FRICTION/view/magnifier/Atom' );

  var useHighRes = true;

  function AtomCanvas( layerWidth, layerHeight, topPositionProperty ) {

    // the local-space coordinates of the area we will be rendering into
    this.layoutBounds = new Bounds2( 0, 0, layerWidth, layerHeight );

    // Property[Vector2] that holds the translation of the top book
    this.topPositionProperty = topPositionProperty;

    // Array[Atom] that holds the Atom views (we get their translation and isTop information from there)
    this.atoms = [];

    // prepare the canvas
    this.canvas = document.createElement( 'canvas' );
    this.context = this.canvas.getContext( '2d' );
    this.backingScale = useHighRes ? Util.backingScale( this.context ) : 1;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = '0';
    this.canvas.style.top = '0';

    // construct ourself with the canvas (now properly initially sized)
    DOM.call( this, this.canvas, {
      preventTransform: true // we manually position it ourselves (Scenery 0.2). Can consider converting this to CanvasNode
    } );

    // on the first step() we want to size our canvas
    this.sizeDirty = true;
  }

  return inherit( DOM, AtomCanvas, {
    // when an Atom view is created, we want a reference so we can quickly scan a list of atoms
    registerAtom: function( atom ) {
      this.atoms.push( atom );
    },

    // called in the view step after the model has been updated
    step: function( timeElapsed ) {
      // if the images have not been loaded yet, bail out (offset is null then, we need a Vector2)
      if ( Atom.atomOffset === null ) {
        return;
      }

      // update the size and position of the Canvas if it is dirty
      if ( this.sizeDirty ) {
        this.sizeDirty = false;

        // we want to position it in the global space
        var globalBounds = this.getUniqueTrail().localToGlobalBounds( this.layoutBounds.copy() ).roundedOut();

        // transform from magnifier to global coordinates
        this.modelViewMatrix = this.getUniqueTrail().getMatrix();

        this.setCanvasLayerBounds( globalBounds );
      }

      // our dictionary of images based on whether the atoms are on the top or bottom
      var images = Atom.atomImages;

      // extracted here for faster inner loop
      var imageScale = Atom.imageScale;
      var imageOffsetX = Atom.atomOffset.x / imageScale;
      var imageOffsetY = Atom.atomOffset.y / imageScale;

      // our MVT scale from local to global coordiantes
      var atomScale = this.modelViewMatrix.getScaleVector().x; // symmetric, x and y should be the same

      // combined scale that is applied to our atom images
      var totalScale = atomScale / imageScale;

      // clear the entire canvas each frame (applies backing scale as needed)
      this.context.setTransform( 1, 0, 0, 1, 0, 0 ); // clear the Canvas in the global coordinate frame
      this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );

      // our context needs the backing transform scaling applied, so that if it is high-resolution (on the iPad), we double the area we render to
      this.context.setTransform( this.backingScale, 0, 0, this.backingScale, 0, 0 );
      for ( var i = 0; i < this.atoms.length; i++ ) {
        var atom = this.atoms[ i ];

        // grab the image to use
        var image = images[ atom.isTopAtom ];

        // draw the image into the correct place on the canvas
        this.context.drawImage( image,
          // source x, y, width, height
          0, 0, image.width, image.height,
          ( imageOffsetX + atom.currentX ) * atomScale, // destination X
          ( imageOffsetY + atom.currentY ) * atomScale, // destination Y
          image.width * totalScale, // destination width
          image.height * totalScale ); // destination height
      }
    },

    // called whenever the scene is resized so that we can reposition on the next step
    layout: function() {
      this.sizeDirty = true;
    },

    // size and position our Canvas to match the global bounds
    setCanvasLayerBounds: function( globalBounds ) {
      // standard way to do high-resolution canvases
      this.canvas.width = globalBounds.width * this.backingScale;
      this.canvas.height = globalBounds.height * this.backingScale;
      this.canvas.style.width = globalBounds.width + 'px';
      this.canvas.style.height = globalBounds.height + 'px';
      this.canvas.style.left = globalBounds.x + 'px';
      this.canvas.style.top = globalBounds.y + 'px';
    },

    updateCSSTransform: function( transform, element ) {
      // NOTE: don't let Scenery apply its normal DOM element transform here - we do it ourselves
    }
  } );
} );
