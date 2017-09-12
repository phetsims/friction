// Copyright 2013-2015, University of Colorado Boulder

/**
 * Container for single book.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var Cover = require( 'FRICTION/friction/view/book/Cover' );
  var friction = require( 'FRICTION/friction' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var KeyboardDragHandler = require( 'SCENERY_PHET/accessibility/KeyboardDragHandler' );

  /**
   * Constructor
   *
   * @param {FrictionModel} model
   * @param {number} x 
   * @param {number} y 
   * @param {string} title - title that appears on the book spine
   * @param {Object} options
   */
  function Book( model, x, y, title, options ) {
    var self = this;
    var dndScale = model.dndScale;

    options = _.extend( {

      // whether or not we can drag the book
      drag: false,
      color: FrictionSharedConstants.BOTTOM_BOOK_COLOR_MACRO
    }, options );

    Node.call( this, options );

    // position the book
    this.x = x;
    this.y = y;

    // add cover
    this.addChild( new Cover( x, y, title, options ) );

    // init drag
    if ( options.drag ) {

      // a11y
      this.tagName = 'div';
      this.ariaRole = 'application';
      this.focusable = true;

      model.initDrag( this );

      // a11y - add a keyboard drag handler
      var oldValue; // determines our delta for how the positionProperty changed every drag
      this.keyboardDragHandler = new KeyboardDragHandler( model.positionProperty,  {
        startDrag: function() {
          oldValue = model.positionProperty.get();
        },
        onDrag: function() {
          var newValue = model.positionProperty.get();
          var delta = { x: newValue.x - oldValue.x, y: newValue.y - oldValue.y };
          
          model.move( delta );

          // update the oldValue for the next onDrag
          oldValue = model.positionProperty.get();
        }
      } );
      this.addAccessibleInputListener( this.keyboardDragHandler );

      // add observer
      model.positionProperty.link( function( v ) {
        self.setTranslation( x + v.x * dndScale, y + v.y * dndScale );
      } );
    }
  }

  friction.register( 'Book', Book );
  
  return inherit( Node, Book, {

    step: function( dt ) {

      // step the keyboard drag handler if one exists on this Book
      this.keyboardDragHandler && this.keyboardDragHandler.step( dt );
    }
  } );
} );
