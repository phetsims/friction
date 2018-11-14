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
  const CoverNode = require( 'FRICTION/friction/view/book/CoverNode' );
  const FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionDragHandler = require( 'FRICTION/friction/view/FrictionDragHandler' );
  const FrictionGrabButton = require( 'FRICTION/friction/view/FrictionGrabButton' );
  const FrictionKeyboardDragListener = require( 'FRICTION/friction/view/FrictionKeyboardDragListener' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Shape = require( 'KITE/Shape' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // a11y strings
  let bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;
  let moveInFourDirectionsString = FrictionA11yStrings.moveInFourDirections.value;
  let bookHelpTextString = FrictionA11yStrings.bookHelpText.value;
  let zoomedInChemistryBookPatternString = FrictionA11yStrings.zoomedInChemistryBookPattern.value;
  let grabButtonHelpTextString = FrictionA11yStrings.grabButtonHelpText.value;

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


      let bookTitle = StringUtils.fillIn( bookTitleStringPattern, { bookTitle: title } );

      this.mutate( {
        cursor: 'pointer'
      } );

      // a11y
      // TODO: rename as the grab and drag a11y interaction
      var grabButtonForBook = new FrictionGrabButton( model.contactProperty, this, {
        thingToGrab: StringUtils.fillIn( zoomedInChemistryBookPatternString, { zoomedIn: '' } ),
        appendDescription: true,
        // tandem: tandem.createTandem( 'chemistryBookNodeGrabButton' ), // TODO: handle this
        // supplementaryCueNode: arrows, // TODO: handle this

        // add a11y options for the interactive BookNode
        a11yDraggableNodeOptions: {
          descriptionContent: grabButtonHelpTextString,

          ariaLabel: bookTitle,
          innerContent: bookTitle,
          focusHighlightLayerable: true
        },
        grabButtonOptions: {
          helpText: bookHelpTextString,
          focusHighlight: focusHighlightRect,
          focusHighlightLayerable: true
        }
      } );
      grabButtonForBook.addChild( focusHighlightRect );

      this.addChild( grabButtonForBook );

      grabButtonForBook.setAccessibleAttribute( 'aria-roledescription', moveInFourDirectionsString );

      // a11y - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragListener( model );
      grabButtonForBook.addAccessibleInputListener( this.keyboardDragHandler );

      // alert the temperature state on focus
      grabButtonForBook.addAccessibleInputListener( {
        focus() {
          if ( model.amplitudeProperty.value === model.amplitudeProperty.initialValue ) {
            FrictionAlertManager.alertSettledAndCool();
          }
        }
      } );

      this.addInputListener( new FrictionDragHandler( model, options.tandem.createTandem( 'dragHandler' ) ) );

      // add observer
      model.topBookPositionProperty.link( position => {
        self.setTranslation( options.x + position.x * model.bookDraggingScaleFactor, options.y + position.y * model.bookDraggingScaleFactor );
      } );
    }
  }

  friction.register( 'BookNode', BookNode );

  return inherit( Node, BookNode );
} );
