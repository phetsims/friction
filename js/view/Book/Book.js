// Copyright 2002-2013, University of Colorado Boulder

/**
 * Container for single book.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Cover = require( 'view/Book/Cover' );

  function Book( model, options ) {
    var self = this, dndScale = model.dndScale;
    Node.call( this, {x: options.x, y: options.y} );

    // add cover
    this.addChild( new Cover( options ) );

    // init drag
    if ( options.drag ) {
      model.initDrag( this );

      // add observer
      model.positionProperty.link( function( v ) {
        self.setTranslation( options.x + v.x * dndScale, options.y + v.y * dndScale );
      } );
    }
  }

  inherit( Node, Book );

  return Book;
} );