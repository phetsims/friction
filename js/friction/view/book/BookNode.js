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
  const CueArrow = require( 'FRICTION/friction/view/CueArrow' );
  const FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionDragHandler = require( 'FRICTION/friction/view/FrictionDragHandler' );
  const FrictionGrabDragInteraction = require( 'FRICTION/friction/view/FrictionGrabDragInteraction' );
  const FrictionKeyboardDragListener = require( 'FRICTION/friction/view/FrictionKeyboardDragListener' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Shape = require( 'KITE/Shape' );
  const SoundClip = require( 'TAMBO/sound-generators/SoundClip' );
  const soundManager = require( 'TAMBO/soundManager' );

  // sounds
  const simplePickupSound = require( 'sound!FRICTION/simple-pickup.mp3' );
  const simpleDropSound = require( 'sound!FRICTION/simple-drop.mp3' );

  // a11y strings
  const chemistryBookString = FrictionA11yStrings.chemistryBook.value;
  const grabButtonHelpTextString = FrictionA11yStrings.grabButtonHelpText.value;

  // constants
  const SOUND_LEVEL = 0.1;

  /**
   * @param {FrictionModel} model
   * @param {string} title - title that appears on the book spine
   * @param {Object} [options]
   * @constructor
   */
  function BookNode( model, title, options ) {
    const self = this;

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
      const focusHighlightRect = new FocusHighlightPath( null );
      const focusHighlightLineWidth = focusHighlightRect.getOuterLineWidth( this );
      focusHighlightRect.setShape( Shape.bounds( this.localBounds.eroded( focusHighlightLineWidth / 2 ) ) );

      // cuing arrows for the book
      const bookCueArrow1 = new CueArrow( {
        rotation: Math.PI,
        right: -10,
        scale: .7
      } );
      const bookCueArrow2 = new CueArrow( {
        left: this.width + 12,
        scale: .7
      } );
      const bookCueArrow3 = new CueArrow( {
        rotation: Math.PI / 2,
        centerX: this.width / 2,
        y: this.height / 2 + 10, // a little further down on the screen, empirical
        scale: .7
      } );
      const arrows = new Node( {
        children: [ bookCueArrow1, bookCueArrow2, bookCueArrow3 ]
      } );

      // sounds used when the book is picked up or dropped
      const bookPickupSoundClip = new SoundClip( simplePickupSound, { initialOutputLevel: SOUND_LEVEL } );
      soundManager.addSoundGenerator( bookPickupSoundClip );
      const bookDropSoundClip = new SoundClip( simpleDropSound, { initialOutputLevel: SOUND_LEVEL } );
      soundManager.addSoundGenerator( bookDropSoundClip );

      // a11y - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragListener( model );

      // alert the temperature state on focus
      const focusListener = {
        focus() {
          if ( model.amplitudeProperty.value === model.amplitudeProperty.initialValue ) {
            FrictionAlertManager.alertSettledAndCool();
          }
        }
      };

      // must be added prior to adding the grab/drag interaction
      this.addChild( focusHighlightRect );
      this.focusHighlight = focusHighlightRect; // this is a constraint of the grab/drag interaction;

      // a11y
      this.a11yGrabDragInteractionNode = new FrictionGrabDragInteraction( model, this, {
        thingToGrab: chemistryBookString,

        // Empirically determined values to place the cue above the book.
        grabCueOptions: {
          x: 60,
          y: -55
        },
        grabbableOptions: {
          appendDescription: true,
          helpText: grabButtonHelpTextString,
          focusHighlight: focusHighlightRect
        },

        onGrab: () => { bookPickupSoundClip.play(); },

        onRelease: () => { bookDropSoundClip.play(); },

        dragCueNode: arrows,

        listenersForDrag: [ this.keyboardDragHandler, focusListener ]
      } );


      this.addInputListener( new FrictionDragHandler( model, options.tandem.createTandem( 'dragHandler' ), {
        startSound: bookPickupSoundClip,
        endSound: bookDropSoundClip
      } ) );

      // add observer
      model.topBookPositionProperty.link( position => {
        self.setTranslation( options.x + position.x * model.bookDraggingScaleFactor, options.y + position.y * model.bookDraggingScaleFactor );
      } );

      this.mutate( {
        cursor: 'pointer',

        // a11y
        focusHighlightLayerable: true
      } );
    }
  }

  friction.register( 'BookNode', BookNode );

  return inherit( Node, BookNode, {
    reset: function() {
      this.a11yGrabDragInteractionNode.reset();
    }
  } );
} );
