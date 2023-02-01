// Copyright 2013-2023, University of Colorado Boulder

/**
 * a Scenery Node that depicts the magnified area between the two books where the atoms can be seen
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import { Circle, FocusHighlightPath, HBox, Node, Path, Rectangle, Voicing } from '../../../../../scenery/js/imports.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import harpDrop_mp3 from '../../../../sounds/harpDrop_mp3.js';
import harpPickup_mp3 from '../../../../sounds/harpPickup_mp3.js';
import friction from '../../../friction.js';
import FrictionStrings from '../../../FrictionStrings.js';
import FrictionConstants from '../../FrictionConstants.js';
import FrictionModel from '../../model/FrictionModel.js';
import CueArrow from '../CueArrow.js';
import FrictionDragListener from '../FrictionDragListener.js';
import FrictionGrabDragInteraction from '../FrictionGrabDragInteraction.js';
import FrictionKeyboardDragListener from '../FrictionKeyboardDragListener.js';
import AtomCanvasNode from './AtomCanvasNode.js';
import MagnifierTargetNode from './MagnifierTargetNode.js';

// constants
const WIDTH = FrictionConstants.MAGNIFIER_WINDOW_WIDTH;
const HEIGHT = FrictionConstants.MAGNIFIER_WINDOW_HEIGHT;
const ROUND = 30;
const SCALE = 0.05;
const SOUND_LEVEL = 0.1;
const ARROW_TOP = 22;

const zoomedInChemistryBookString = FrictionStrings.a11y.zoomedInChemistryBook;

class MagnifierNode extends Voicing( Node ) {

  /**
   * @param {FrictionModel} model
   * @param {number} targetX - x position of the MagnifierTargetNode rectangle
   * @param {number} targetY - y position of the MagnifierTargetNode rectangle
   * @param {string} title - the title of the book that is draggable, used for a11y
   * @param {TemperatureIncreasingAlerter} temperatureIncreasingAlerter
   * @param {TemperatureDecreasingAlerter} temperatureDecreasingAlerter
   * @param {BookMovementAlerter} bookMovementAlerter
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {function():} alertSettledAndCool
   * @param {Object} [options]
   */
  constructor( model,
               targetX,
               targetY,
               title,
               temperatureIncreasingAlerter,
               temperatureDecreasingAlerter,
               bookMovementAlerter,
               grabbedDescriber,
               alertSettledAndCool,
               options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      interactiveHighlight: 'invisible'
    }, options );

    super( options );

    // add container for clipping
    this.container = new Node();
    this.addChild( this.container );

    // @private - container where the individual atoms will be placed
    this.topAtomsLayer = new Node();

    // init drag for background
    const background = new Rectangle(
      -1.125 * WIDTH,
      -HEIGHT,
      3.25 * WIDTH,
      4 * HEIGHT / 3 - FrictionModel.MAGNIFIED_ATOMS_INFO.distance,
      ROUND,
      ROUND, {
        fill: FrictionConstants.TOP_BOOK_COLOR,
        cursor: 'pointer'
      }
    );

    // init drag for drag area
    const atomDragArea = new VoicingRectangle(
      0.055 * WIDTH,
      0.175 * HEIGHT,
      0.875 * WIDTH,
      FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY * 6, {
        fill: null,
        cursor: 'pointer',
        children: [ background ],

        // phet-io
        tandem: options.tandem.createTandem( 'atomDragArea' ),
        phetioVisiblePropertyInstrumented: false,
        phetioInputEnabledPropertyInstrumented: true,

        // pdom
        focusHighlightLayerable: true,

        // interactive highlights
        interactiveHighlightLayerable: true,

        // voicing
        voicingNameResponse: zoomedInChemistryBookString
      } );

    // arrow icon
    const leftArrow = new CueArrow( { rotation: Math.PI, fill: 'white' } );
    const rightArrow = new CueArrow( { fill: 'white' } );
    const visualArrowIcon = new HBox( {
      children: [ leftArrow, rightArrow ],
      spacing: 20,
      centerX: WIDTH / 2,
      top: ARROW_TOP,

      // Cue arrows are visible if hintProperty is true, and if the inputEnabledProperty is true (can be disabled in studio)
      visibleProperty: DerivedProperty.and( [ model.hintProperty, atomDragArea.inputEnabledProperty ] )
    } );

    // Intermediate Node to support PhET-iO instrumentation that can control the visibility and bypass the sim reverting it (like via reset).
    const hintArrowsNode = new Node( {
      children: [ visualArrowIcon ],
      tandem: options.tandem.createTandem( 'hintArrowsNode' ),
      phetioDocumentation: 'the node that holds the visual hint, or "cue" arrows'
    } );

    // create and register the sound generators that will be used when the top book is picked up and dropped
    const bookPickupSoundClip = new SoundClip( harpPickup_mp3, { initialOutputLevel: SOUND_LEVEL } );
    soundManager.addSoundGenerator( bookPickupSoundClip );
    const bookDropSoundClip = new SoundClip( harpDrop_mp3, { initialOutputLevel: SOUND_LEVEL } );
    soundManager.addSoundGenerator( bookDropSoundClip );

    // @private - add bottom book
    this.bottomBookBackground = new Node( {
      children: [
        new Rectangle(
          3,
          2 * HEIGHT / 3 - 2,
          WIDTH - 6,
          HEIGHT / 3,
          0,
          ROUND - 3,
          { fill: FrictionConstants.BOTTOM_BOOK_COLOR }
        )
      ]
    } );

    // add the "bumps" to the book
    addRowCircles(
      FrictionModel.MAGNIFIED_ATOMS_INFO.radius,
      FrictionModel.MAGNIFIED_ATOMS_INFO.distanceX,
      this.bottomBookBackground,
      {
        color: FrictionConstants.BOTTOM_BOOK_COLOR,
        x: -FrictionModel.MAGNIFIED_ATOMS_INFO.distanceX / 2,
        y: 2 * HEIGHT / 3 - 2,
        width: WIDTH
      }
    );
    this.container.addChild( this.bottomBookBackground );

    // @private - add top book
    this.topBookBackground = new Node();

    atomDragArea.addInputListener( new FrictionDragListener( model, temperatureIncreasingAlerter, temperatureDecreasingAlerter,
      bookMovementAlerter, {
        tandem: options.tandem.createTandem( 'dragListener' ),
        startSound: bookPickupSoundClip,
        endSound: bookDropSoundClip,
        targetNode: this.topBookBackground,
        startDrag: () => atomDragArea.voicingSpeakFullResponse( {
          objectResponse: grabbedDescriber.getVoicingGrabbedObjectResponse()
        } )
      } ) );

    this.topBookBackground.addChild( atomDragArea );

    // add arrows before the drag area, then the grab cue hides the arrows
    this.topBookBackground.addChild( hintArrowsNode );

    addRowCircles(
      FrictionModel.MAGNIFIED_ATOMS_INFO.radius,
      FrictionModel.MAGNIFIED_ATOMS_INFO.distanceX,
      this.topBookBackground,
      {
        color: FrictionConstants.TOP_BOOK_COLOR,
        x: -WIDTH,
        y: HEIGHT / 3 - FrictionModel.MAGNIFIED_ATOMS_INFO.distance,
        width: 3 * WIDTH
      }
    );

    // a11y - Custom shape highlights, shape will change with atomRowsToShearOffProperty. Focus and Interactive
    // highlights are identical, but we need two different Nodes because GrabDragInteraction adds children to the
    // focus highlight that are specific to the keyboard interaction.
    const focusHighlightPath = new FocusHighlightPath( getFocusHighlightShape( atomDragArea ) );
    const interactiveHighlightPath = new FocusHighlightPath( getFocusHighlightShape( atomDragArea ) );
    focusHighlightPath.pickable = false;
    interactiveHighlightPath.pickable = false;

    // pdom - the GrabDragInteraction is positioned based on the whole drag area, but the center of that is behind
    // the background white, so set a source Node to support mobile a11y that has a center that will respond to a pointer
    // down
    atomDragArea.setPDOMTransformSourceNode( interactiveHighlightPath );

    // a11y - add the focus highlight on top of the row circles must be added prior to adding the grab/drag interaction
    // this is a constraint of the grab/drag interaction, must be set before it's creation, but only for
    // focusHighlightLayerable
    this.topBookBackground.addChild( focusHighlightPath );
    this.topBookBackground.addChild( interactiveHighlightPath );
    atomDragArea.focusHighlight = focusHighlightPath;
    atomDragArea.interactiveHighlight = interactiveHighlightPath;

    // cuing arrows for the book
    const bookCueArrowLeft = new CueArrow( {
      rotation: Math.PI
    } );
    const bookCueArrowRight = new CueArrow();

    const horizontalCueArrows = new HBox( {
      children: [ bookCueArrowLeft, bookCueArrowRight ],
      spacing: 30, // to be scaled down below
      centerX: WIDTH / 2,
      top: ARROW_TOP
    } );

    const bookCueArrowVertical = new CueArrow( {
      top: horizontalCueArrows.centerY,
      arrowLength: 55,
      rotation: Math.PI / 2,
      centerX: WIDTH / 2

    } );
    const cueArrows = new Node( {
      children: [ horizontalCueArrows, bookCueArrowVertical ],
      scale: 0.6,
      centerX: WIDTH / 2,
      top: ARROW_TOP
    } );

    // pdom - add the keyboard drag listener to the top atoms
    this.keyboardDragListener = new FrictionKeyboardDragListener( model, temperatureIncreasingAlerter,
      temperatureDecreasingAlerter, bookMovementAlerter, {
        tandem: options.tandem.createTandem( 'keyboardDragListener' )
      } );

    // pdom
    const grabDragInteraction = new FrictionGrabDragInteraction( model, this.keyboardDragListener, atomDragArea, grabbedDescriber, alertSettledAndCool, {
      objectToGrabString: zoomedInChemistryBookString,
      tandem: options.tandem.createTandem( 'grabDragInteraction' ),
      grabCueOptions: {
        center: atomDragArea.center.plusXY( 0, 102 ) // empirically determined
      },
      grabbableOptions: {
        focusHighlight: focusHighlightPath
      },

      // The help text is provided by the BookNode's interaction
      keyboardHelpText: null,
      gestureHelpText: null,

      // handler for when the user grabs the book
      onGrab: () => {
        model.hintProperty.set( false ); // hide the visual cue arrows
        bookPickupSoundClip.play();
      },

      // handler for when the user releases the book
      onRelease: () => {
        bookDropSoundClip.play();
      },

      dragCueNode: cueArrows
    } );

    this.container.addChild( this.topBookBackground );

    atomDragArea.inputEnabledProperty.link( inputEnabled => {
      model.hintProperty.value = inputEnabled;
      grabDragInteraction.enabled = inputEnabled;
    } );

    // Add the red border around the magnified area, and add a white shape below it to block out the clipped area.
    const topPadding = 500;
    const sidePadding = 800;
    const bottomPadding = 10; // don't go too far below the magnifier
    const rightX = WIDTH + sidePadding;
    const leftX = -sidePadding;
    const topY = -topPadding;
    const bottomY = HEIGHT + bottomPadding;
    const innerLowX = ROUND;
    const innerHighX = WIDTH - ROUND;
    const innerLowY = ROUND;
    const innerHighY = HEIGHT - ROUND;
    this.addChild( new Path( new Shape().moveTo( rightX, topY )
      .lineTo( leftX, topY )
      .lineTo( leftX, bottomY )
      .lineTo( rightX, bottomY )
      .lineTo( rightX, topY )
      .lineTo( innerHighX, innerLowY - ROUND )
      .arc( innerHighX, innerLowY, ROUND, -Math.PI / 2, 0, false )
      .arc( innerHighX, innerHighY, ROUND, 0, Math.PI / 2, false )
      .arc( innerLowX, innerHighY, ROUND, Math.PI / 2, Math.PI, false )
      .arc( innerLowX, innerLowY, ROUND, Math.PI, Math.PI * 3 / 2, false )
      .lineTo( innerHighX, innerLowY - ROUND )
      .close(), {
      fill: 'white',
      pickable: true // absorb the input instead of grabbing the book through the background
    } ) );

    // add the containing border rectangle
    this.addChild( new Rectangle( 0, 0, WIDTH, HEIGHT, ROUND, ROUND, {
      stroke: 'black',
      lineWidth: 5,
      pickable: false
    } ) );

    // add magnifier's target
    const magnifierTargetNode = new MagnifierTargetNode(
      targetX,
      targetY,
      WIDTH * SCALE,
      HEIGHT * SCALE,
      ROUND * SCALE,
      new Vector2( ROUND, HEIGHT ),
      new Vector2( WIDTH - ROUND, HEIGHT )
    );
    this.addChild( magnifierTargetNode );

    // @private - Add the canvas where the atoms will be rendered. For better performance, particularly on iPad, we are
    // using CanvasNode to render the atoms instead of individual nodes.
    this.atomCanvasNode = new AtomCanvasNode( model.atoms, {
      canvasBounds: new Bounds2( 0, 0, WIDTH, HEIGHT )
    } );
    this.container.addChild( this.atomCanvasNode );

    model.topBookPositionProperty.linkAttribute( this.topBookBackground, 'translation' );
    model.topBookPositionProperty.linkAttribute( this.topAtomsLayer, 'translation' );

    model.atomRowsToShearOffProperty.link( number => {

      // Adjust the drag area as the number of rows of atoms shears off.
      atomDragArea.setRectHeight( ( number + 2 ) * FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY );

      // Update the size of the highlights accordingly
      const highlightShape = getFocusHighlightShape( atomDragArea );
      focusHighlightPath.setShape( highlightShape );
      interactiveHighlightPath.setShape( highlightShape );

    } );

    // @private
    this.resetMagnifierNode = () => {
      grabDragInteraction.reset();
    };
  }

  /**
   * move forward in time
   * @public
   */
  step() {
    this.atomCanvasNode.invalidatePaint(); // tell the atom canvas to redraw itself on every step
  }

  /**
   * @public
   */
  reset() {
    this.resetMagnifierNode();
  }
}

friction.register( 'MagnifierNode', MagnifierNode );

// helper function that adds a row of circles at the specified position, used to add bumps to the magnified books
function addRowCircles( circleRadius, xSpacing, parentNode, options ) {
  const numberOfAtomsForRow = options.width / xSpacing;
  for ( let i = 0; i < numberOfAtomsForRow; i++ ) {
    parentNode.addChild( new Circle( circleRadius, {
      fill: options.color,
      y: options.y,
      x: options.x + xSpacing * i,
      pickable: false // input should pass through to a background Node which may support input depending on the atom circle.
    } ) );
  }
}

class VoicingRectangle extends Voicing( Rectangle ) {
  constructor( x, y, width, height, options ) {
    super( x, y, width, height, options );
  }
}

/**
 *
 * @param {Node} dragArea
 * @returns {Shape}
 */
function getFocusHighlightShape( dragArea ) {

  // Use selfBounds because the dragArea has children that are larger than the focusHighlight we want.
  return Shape.bounds( dragArea.selfBounds.withOffsets( 0, 40, 0, 0 ) );
}

export default MagnifierNode;