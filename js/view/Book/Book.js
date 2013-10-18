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
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  function Book( model, options ) {
    var self = this;
    Node.call( this, {x: options.x, y: options.y} );

    // add cover
    this.addChild( new Cover( options ) );

    // init drag
    if ( options.drag ) {
      initDrag( this, model );

      model.positionProperty.link( function( v ) {
        self.setX( options.x + v.x );
        self.setY( options.y + v.y );
      } );
    }
  }

  inherit( Node, Book );

  var initDrag = function( book, model ) {
    var coeff = model.dndScale;
    book.cursor = 'pointer';
    book.addInputListener( new SimpleDragHandler( {
      translate: function( e ) {
        model.move( {x: e.delta.x * coeff, y: e.delta.y * coeff} );
      }
    } ) );
  };

  return Book;
} );