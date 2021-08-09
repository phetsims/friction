// Copyright 2013-2021, University of Colorado Boulder

/**
 * Displays a single macroscopic book.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Shape from '../../../../../kite/js/Shape.js';
import merge from '../../../../../phet-core/js/merge.js';
import FocusHighlightPath from '../../../../../scenery/js/accessibility/FocusHighlightPath.js';
import Voicing from '../../../../../scenery/js/accessibility/voicing/Voicing.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import simpleDropSound from '../../../../sounds/simple-drop_mp3.js';
import simplePickupSound from '../../../../sounds/simple-pickup_mp3.js';
import friction from '../../../friction.js';
import frictionStrings from '../../../frictionStrings.js';
import FrictionConstants from '../../FrictionConstants.js';
import CueArrow from '../CueArrow.js';
import FrictionAlertManager from '../FrictionAlertManager.js';
import FrictionDragListener from '../FrictionDragListener.js';
import FrictionGrabDragInteraction from '../FrictionGrabDragInteraction.js';
import FrictionKeyboardDragListener from '../FrictionKeyboardDragListener.js';
import CoverNode from './CoverNode.js';

// constants
const chemistryBookString = frictionStrings.a11y.chemistryBook;
const grabButtonHelpTextString = frictionStrings.a11y.grabButtonHelpText;

const SOUND_LEVEL = 0.1;

class BookNode extends Node {
  /**
   * @param {FrictionModel} model
   * @param {string} title - title that appears on the book spine
   * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
   * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
   * @param {BookMovementDescriber} bookMovementDescriber
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, title, temperatureIncreasingDescriber, temperatureDecreasingDescriber, bookMovementDescriber, grabbedDescriber, tandem, options ) {

    options = merge( {

      // whether or not we can drag the book
      drag: false,
      color: FrictionConstants.BOTTOM_BOOK_COLOR_MACRO,

      // voicing
      voicingNameResponse: chemistryBookString
    }, options );

    assert && assert( typeof options.x === 'number', 'options.x must be specified' );
    assert && assert( typeof options.y === 'number', 'options.y must be specified' );

    super( options );

    // add cover, pass the whole tandem to hide the "cover" implementation detail
    this.addChild( new CoverNode( title, tandem, options ) );

    // init drag and a11y options for the draggable book
    if ( options.drag ) {

      this.initializeVoicing( options );

      // instrument this book, but not the other
      options.tandem = tandem;

      // We want the focus highlight to be completely within the bounds of the book.
      const focusHighlightRect = new FocusHighlightPath( null );
      const focusHighlightLineWidth = focusHighlightRect.getOuterLineWidth( this );
      focusHighlightRect.setShape( Shape.bounds( this.localBounds.eroded( focusHighlightLineWidth / 2 ) ) );

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
      const bookPickupSoundClip = new SoundClip( simplePickupSound, { initialOutputLevel: SOUND_LEVEL } );
      soundManager.addSoundGenerator( bookPickupSoundClip );
      const bookDropSoundClip = new SoundClip( simpleDropSound, { initialOutputLevel: SOUND_LEVEL } );
      soundManager.addSoundGenerator( bookDropSoundClip );

      // pdom - add a keyboard drag handler
      this.keyboardDragHandler = new FrictionKeyboardDragListener( model, temperatureIncreasingDescriber,
        temperatureDecreasingDescriber, bookMovementDescriber );

      // alert the temperature state on focus
      const focusListener = {
        focus() {
          if ( model.vibrationAmplitudeProperty.value === model.vibrationAmplitudeProperty.initialValue ) {
            FrictionAlertManager.alertSettledAndCool();
          }

          this.voicingSpeakNameResponse();
        }
      };

      // must be added prior to adding the grab/drag interaction
      this.addChild( focusHighlightRect );
      this.focusHighlight = focusHighlightRect; // this is a constraint of the grab/drag interaction;

      // @private - a11y
      this.grabDragInteraction = new FrictionGrabDragInteraction( model, this.keyboardDragHandler, this, grabbedDescriber, {
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

        listenersForDragState: [ focusListener ],

        tandem: tandem.createTandem( 'grabDragInteraction' )
      } );


      this.addInputListener( new FrictionDragListener( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber,
        bookMovementDescriber, options.tandem.createTandem( 'dragHandler' ), {
          startSound: bookPickupSoundClip,
          endSound: bookDropSoundClip,
          targetNode: this,
          startDrag: () => this.voicingSpeakFullResponse( {
            objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse(),
            hintResponse: grabbedDescriber.getVoicingGrabbedHintResponse()
          } )
        } ) );

      // add observer
      model.topBookPositionProperty.link( position => {
        this.setTranslation( options.x + position.x * model.bookDraggingScaleFactor, options.y + position.y * model.bookDraggingScaleFactor );
      } );

      this.mutate( {
        cursor: 'pointer',

        // pdom
        focusHighlightLayerable: true
      } );
    }
  }


  /**
   * @public
   */
  reset() {
    this.grabDragInteraction.reset();
  }
}

Voicing.compose( BookNode );

friction.register( 'BookNode', BookNode );

export default BookNode;