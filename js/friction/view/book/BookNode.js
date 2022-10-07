// Copyright 2013-2022, University of Colorado Boulder

/**
 * Displays a single macroscopic book.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import { FocusHighlightPath, Node, Voicing } from '../../../../../scenery/js/imports.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import simpleDrop_mp3 from '../../../../sounds/simpleDrop_mp3.js';
import simplePickup_mp3 from '../../../../sounds/simplePickup_mp3.js';
import friction from '../../../friction.js';
import FrictionStrings from '../../../FrictionStrings.js';
import FrictionConstants from '../../FrictionConstants.js';
import CueArrow from '../CueArrow.js';
import FrictionDragListener from '../FrictionDragListener.js';
import FrictionGrabDragInteraction from '../FrictionGrabDragInteraction.js';
import FrictionKeyboardDragListener from '../FrictionKeyboardDragListener.js';
import CoverNode from './CoverNode.js';

// constants
const chemistryBookString = FrictionStrings.a11y.chemistryBook;
const grabButtonHelpTextString = FrictionStrings.a11y.grabButtonHelpText;

const SOUND_LEVEL = 0.1;

class BookNode extends Voicing( Node ) {
  /**
   * @param {FrictionModel} model
   * @param {string} title - title that appears on the book spine
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {function():} alertSettledAndCool
   * @param {Object} [options]
   */
  constructor( model, title, temperatureIncreasingAlerter, temperatureDecreasingAlerter, bookMovementAlerter, grabbedDescriber, alertSettledAndCool, options ) {

    options = merge( {

      // whether or not we can drag the book
      drag: false,
      color: FrictionConstants.BOTTOM_BOOK_COLOR_MACRO,

      // voicing
      voicingNameResponse: chemistryBookString,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioVisiblePropertyInstrumented: false
    }, options );

    assert && assert( typeof options.x === 'number', 'options.x must be specified' );
    assert && assert( typeof options.y === 'number', 'options.y must be specified' );

    super( options );

    // add cover, pass the whole tandem to hide the "cover" implementation detail
    this.addChild( new CoverNode( title, options.tandem, _.omit( options, [ 'tandem' ] ) ) );

    // init drag and a11y options for the draggable book
    if ( options.drag ) {

      // a11y - We want the highlights to be completely within the bounds of the book.
      const focusHighlightRect = new FocusHighlightPath( null );
      const highlightLineWidth = focusHighlightRect.getOuterLineWidth( this );
      const highlightShape = Shape.bounds( this.localBounds.eroded( highlightLineWidth / 2 ) );
      focusHighlightRect.setShape( highlightShape );

      const interactiveHighlightRect = new FocusHighlightPath( null );
      interactiveHighlightRect.setShape( highlightShape );

      // cuing arrows for the book
      const bookCueArrow1 = new CueArrow( {
        rotation: Math.PI,
        right: -10,
        scale: 0.7
      } );
      const bookCueArrow2 = new CueArrow( {
        left: this.width + 12,
        scale: 0.7
      } );
      const bookCueArrow3 = new CueArrow( {
        rotation: Math.PI / 2,
        centerX: this.width / 2,
        y: this.height / 2 + 10, // a little further down on the screen, empirical
        scale: 0.7
      } );
      const arrows = new Node( {
        children: [ bookCueArrow1, bookCueArrow2, bookCueArrow3 ]
      } );

      // sounds used when the book is picked up or dropped
      const bookPickupSoundClip = new SoundClip( simplePickup_mp3, { initialOutputLevel: SOUND_LEVEL } );
      soundManager.addSoundGenerator( bookPickupSoundClip );
      const bookDropSoundClip = new SoundClip( simpleDrop_mp3, { initialOutputLevel: SOUND_LEVEL } );
      soundManager.addSoundGenerator( bookDropSoundClip );

      // pdom - add a keyboard drag handler
      this.keyboardDragListener = new FrictionKeyboardDragListener( model, temperatureIncreasingAlerter,
        temperatureDecreasingAlerter, bookMovementAlerter, {
          tandem: options.tandem.createTandem( 'keyboardDragListener' )
        } );

      // highlights must be added prior to adding the grab/drag interaction, this is a constraint of GrabDragInteraction
      this.addChild( focusHighlightRect );
      this.focusHighlight = focusHighlightRect;
      this.addChild( interactiveHighlightRect );
      this.interactiveHighlight = interactiveHighlightRect;

      this.focusHighlightLayerable = true;
      this.interactiveHighlightLayerable = true;

      // @private - a11y
      this.grabDragInteraction = new FrictionGrabDragInteraction( model, this.keyboardDragListener, this, grabbedDescriber, alertSettledAndCool, {
        objectToGrabString: chemistryBookString,

        // Empirically determined values to place the cue above the book.
        grabCueOptions: {
          x: 45,
          y: -60
        },
        grabbableOptions: {
          focusHighlight: focusHighlightRect
        },

        keyboardHelpText: grabButtonHelpTextString,

        onGrab: () => { bookPickupSoundClip.play(); },

        onRelease: () => { bookDropSoundClip.play(); },

        dragCueNode: arrows,

        tandem: options.tandem.createTandem( 'grabDragInteraction' )
      } );

      this.addInputListener( new FrictionDragListener( model, temperatureIncreasingAlerter, temperatureDecreasingAlerter,
        bookMovementAlerter, {
          tandem: options.tandem.createTandem( 'dragListener' ),
          startSound: bookPickupSoundClip,
          endSound: bookDropSoundClip,
          targetNode: this,
          startDrag: () => this.voicingSpeakFullResponse( {
            objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse()
          } )
        } ) );

      // This transform uses the assumption that model coords and the magnified view are in the same coordinate frame,
      // and that it's origin is zero, and that the BookNode is positioned with x/y options.
      const transform = ModelViewTransform2.createSinglePointScaleMapping( Vector2.ZERO, new Vector2( options.x, options.y ),
        model.bookDraggingScaleFactor );

      // add observer
      model.topBookPositionProperty.link( position => {
        this.setTranslation( transform.transformPosition2( position ) );
      } );

      this.inputEnabledProperty.link( inputEnabled => {
        this.grabDragInteraction.enabled = inputEnabled;
      } );

      this.cursor = 'pointer';
    }
  }


  /**
   * @public
   */
  reset() {
    this.grabDragInteraction.reset();
  }
}

friction.register( 'BookNode', BookNode );

export default BookNode;