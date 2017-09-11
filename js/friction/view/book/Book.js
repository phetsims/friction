// Copyright 2013-2015, University of Colorado Boulder

/**
 * Container for single book.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';
  var Cover = require( 'FRICTION/friction/view/book/Cover' );
  var friction = require( 'FRICTION/friction' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  function Book( model, options ) {
    var self = this;
    var dndScale = model.dndScale;

    Node.call( this, options );

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

  friction.register( 'Book', Book );
  
  return inherit( Node, Book );
} );
