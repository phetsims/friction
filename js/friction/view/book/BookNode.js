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
  let CoverNode = require( 'FRICTION/friction/view/book/CoverNode' );
  let DragHandler = require( 'FRICTION/friction/view/DragHandler' );
  let FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  let friction = require( 'FRICTION/friction' );
  let FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  let FrictionKeyboardDragHandler = require( 'FRICTION/friction/view/FrictionKeyboardDragHandler' );
  let FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  let inherit = require( 'PHET_CORE/inherit' );
  let Node = require( 'SCENERY/nodes/Node' );
  let Shape = require( 'KITE/Shape' );
  let StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // a11y strings
  let bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;
  let moveInFourDirectionsString = FrictionA11yStrings.moveInFourDirections.value;
  let bookHelpTextString = FrictionA11yStrings.bookHelpText.value;

  /**
   * @param {FrictionModel} model
   * @param {string} title - title that appears on the book spine
   * @param {Object} [options]
   * @constructor
   */
  function BookNode( model, title, options ) {
    let self = this;

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
      let focusHighlightRect = new FocusHighlightPath( null );
      let focusHighlightLineWidth = focusHighlightRect.getOuterLineWidth( this );
      focusHighlightRect.setShape( Shape.bounds( this.localBounds.eroded( focusHighlightLineWidth / 2 ) ) );

      this.addChild( focusHighlightRect );

      // add a11y options for the interactive BookNode
      this.mutate( {
        tagName: 'div',
        ariaRole: 'application',
        innerContent: StringUtils.fillIn( bookTitleStringPattern, { bookTitle: title } ),
        helpText: bookHelpTextString,
        focusable: true,
        focusHighlightLayerable: true,
        focusHighlight: focusHighlightRect,
        cursor: 'pointer'
      } );

      this.setAccessibleAttribute( 'aria-roledescription', moveInFourDirectionsString );

      this.addInputListener( new DragHandler( model, options.tandem.createTandem( 'dragHandler' ) ) );

      // a11y - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragHandler( model );
      this.addAccessibleInputListener( this.keyboardDragHandler );

      // add observer
      model.topBookPositionProperty.link( function( position ) {
        self.setTranslation( options.x + position.x * model.bookDraggingScaleFactor, options.y + position.y * model.bookDraggingScaleFactor );
      } );
    }
  }

  friction.register( 'BookNode', BookNode );

  return inherit( Node, BookNode );
} );
