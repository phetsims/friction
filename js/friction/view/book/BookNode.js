// Copyright 2013-2018, University of Colorado Boulder

/**
 * Container for single book.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var CoverNode = require( 'FRICTION/friction/view/book/CoverNode' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var FrictionKeyboardDragHandler = require( 'FRICTION/friction/view/FrictionKeyboardDragHandler' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // a11y strings
  var bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;

  /**
   * @param {FrictionModel} model
   * @param {string} title - title that appears on the book spine
   * @param {Object} options
   * @constructor
   */
  function BookNode( model, title, options ) {
    var self = this;

    options = _.extend( {

      // whether or not we can drag the book
      drag: false,
      color: FrictionSharedConstants.BOTTOM_BOOK_COLOR_MACRO
    }, options );

    assert && assert( typeof options.x === 'number', 'options.x must be specified' );
    assert && assert( typeof options.y === 'number', 'options.y must be specified' );

    Node.call( this, options );

    // add cover
    this.addChild( new CoverNode( options.x, options.y, title, options ) );

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
        parentContainerAriaRole: 'application',
        parentContainerTagName: 'div',
        prependLabels: true,
        accessibleLabel: StringUtils.fillIn( bookTitleStringPattern, { bookTitle: title } ),
        focusable: true,
        focusHighlightLayerable: true,
        focusHighlight: focusHighlightRect
      } );

      // this node is labelledby its own label
      this.setAriaLabelledByNode( this );
      this.setAriaLabelledContent( AccessiblePeer.PARENT_CONTAINER );

      // TODO: this seems odd
      model.addDragInputListener( this, options.tandem.createTandem( 'dragHandler' ) );

      // a11y - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragHandler( model );
      this.addAccessibleInputListener( this.keyboardDragHandler );

      // add observer
      model.positionProperty.link( function( position ) {
        self.setTranslation( options.x + position.x * model.dndScale, options.y + position.y * model.dndScale );
      } );
    }
  }

  friction.register( 'BookNode', BookNode );

  return inherit( Node, BookNode );
} );
