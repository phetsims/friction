// Copyright 2013-2018, University of Colorado Boulder

/**
 * Displays a single macroscopic book.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var CoverNode = require( 'FRICTION/friction/view/book/CoverNode' );
  var DragHandler = require( 'FRICTION/friction/view/DragHandler' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var FrictionKeyboardDragHandler = require( 'FRICTION/friction/view/FrictionKeyboardDragHandler' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // a11y strings
  var bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;

  /**
   * @param {FrictionModel} model
   * @param {string} title - title that appears on the book spine
   * @param {Object} [options]
   * @constructor
   */
  function BookNode( model, title, options ) {
    var self = this;

    options = _.extend( {

      // whether or not we can drag the book
      drag: false,
      color: FrictionConstants.BOTTOM_BOOK_COLOR_MACRO
    }, options );

    assert && assert( typeof options.x === 'number', 'options.x must be specified' );
    assert && assert( typeof options.y === 'number', 'options.y must be specified' );

    Node.call( this, options );

    // add cover
    this.addChild( new CoverNode( title, options ) );

    // init drag and a11y options for the draggable book
    if ( options.drag ) {

      // We want the focus highlight to be completely within the bounds of the book.
      var focusHighlightRect = new FocusHighlightPath( null );
      var focusHighlightLineWidth = focusHighlightRect.getOuterLineWidth( this );
      focusHighlightRect.setShape( Shape.bounds( this.localBounds.eroded( focusHighlightLineWidth / 2 ) ) );

      this.addChild( focusHighlightRect );

      // add a11y options for the interactive BookNode
      this.mutate( {
        tagName: 'div',
        containerAriaRole: 'application',
        containerTagName: 'div',
        prependLabels: true,
        innerContent: StringUtils.fillIn( bookTitleStringPattern, { bookTitle: title } ),
        focusable: true,
        focusHighlightLayerable: true,
        focusHighlight: focusHighlightRect,
        cursor: 'pointer'
      } );

      // this node is labelledby its own label
      this.setAriaLabelledByNode( this );
      this.setAriaLabelledContent( AccessiblePeer.CONTAINER_PARENT );

      this.addInputListener( new DragHandler( model, options.tandem.createTandem( 'dragHandler' ) ) );

      // a11y - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragHandler( model );
      this.addAccessibleInputListener( this.keyboardDragHandler );

      // add observer
      model.bookPositionProperty.link( function( position ) {
        self.setTranslation( options.x + position.x * model.bookDraggingScaleFactor, options.y + position.y * model.bookDraggingScaleFactor );
      } );
    }
  }

  friction.register( 'BookNode', BookNode );

  return inherit( Node, BookNode );
} );
