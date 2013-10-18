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
    var self = this;
    Node.call( this, {x: options.x, y: options.y} );

    // add cover
    this.addChild( new Cover( options ) );

    // init drag
    if ( options.drag ) {
      model.initDrag( this );

      // add observer
      model.positionProperty.link( function( v ) {
        self.setX( options.x + v.x * model.dndScale );
        self.setY( options.y + v.y * model.dndScale );
      } );
    }
  }

  inherit( Node, Book );

  return Book;
} );