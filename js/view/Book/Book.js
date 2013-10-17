/**
 * Copyright 2002-2013, University of Colorado
 * Container for book
 *
 * @author Andrey Zelenkov (Mlearner)
 */


define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Cover = require( 'view/Book/Cover' );

  function Book( model, options ) {
    Node.call( this, {x: options.x, y: options.y} );

    // add cover
    this.addChild( new Cover( options ) );

    // init drag
    if ( options.drag ) {
      initDrag( this, model, options );
    }
  }

  inherit( Node, Book );

  var initDrag = function( book, model, options ) {

  };

  return Book;
} );