// Copyright 2013-2021, University of Colorado Boulder

/**
 * a Scenery Node that depicts the magnified area between the two books where the atoms can be seen
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Shape from '../../../../../kite/js/Shape.js';
import merge from '../../../../../phet-core/js/merge.js';
import FocusHighlightPath from '../../../../../scenery/js/accessibility/FocusHighlightPath.js';
import Voicing from '../../../../../scenery/js/accessibility/voicing/Voicing.js';
import Circle from '../../../../../scenery/js/nodes/Circle.js';
import HBox from '../../../../../scenery/js/nodes/HBox.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import Path from '../../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../../scenery/js/nodes/Rectangle.js';
import SoundClip from '../../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../../tambo/js/soundManager.js';
import Tandem from '../../../../../tandem/js/Tandem.js';
import harpDropSound from '../../../../sounds/harp-drop_mp3.js';
import harpPickupSound from '../../../../sounds/harp-pickup_mp3.js';
import friction from '../../../friction.js';
import frictionStrings from '../../../frictionStrings.js';
import FrictionConstants from '../../FrictionConstants.js';
import FrictionModel from '../../model/FrictionModel.js';
import CueArrow from '../CueArrow.js';
import FrictionAlertManager from '../FrictionAlertManager.js';
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

const zoomedInChemistryBookString = frictionStrings.a11y.zoomedInChemistryBook;

class MagnifierNode extends Node {

  /**
   * @param {FrictionModel} model
   * @param {number} targetX - x position of the MagnifierTargetNode rectangle
   * @param {number} targetY - y position of the MagnifierTargetNode rectangle
   * @param {string} title - the title of the book that is draggable, used for a11y
   * @param {TemperatureIncreasingDescriber} temperatureIncreasingDescriber
   * @param {TemperatureDecreasingDescriber} temperatureDecreasingDescriber
   * @param {BookMovementDescriber} bookMovementDescriber
   * @param {GrabbedDescriber} grabbedDescriber
   * @param {Object} [options]
   */
  constructor( model, targetX, targetY, title, temperatureIncreasingDescriber, temperatureDecreasingDescriber, bookMovementDescriber, grabbedDescriber, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    this.initializeVoicing( options );

    // add container for clipping
    this.container = new Node();
    this.addChild( this.container );

    // @private - container where the individual atoms will be placed
    this.topAtomsLayer = new Node();

    // arrow icon
    const leftArrow = new CueArrow( { rotation: Math.PI, fill: 'white' } );
    const rightArrow = new CueArrow( { fill: 'white' } );
    const visualArrowIcon = new HBox( {
      children: [ leftArrow, rightArrow ],
      spacing: 20,
      centerX: WIDTH / 2,
      top: ARROW_TOP
    } );

    // create and register the sound generators that will be used when the top book is picked up and dropped
    const bookPickupSoundClip = new SoundClip( harpPickupSound, { initialOutputLevel: SOUND_LEVEL } );
    soundManager.addSoundGenerator( bookPickupSoundClip );
    const bookDropSoundClip = new SoundClip( harpDropSound, { initialOutputLevel: SOUND_LEVEL } );
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

    // init drag for background
    const background = new Rectangle(
      -1.125 * WIDTH,
      -HEIGHT,
      3.25 * WIDTH,
      4 * HEIGHT / 3 - FrictionModel.MAGNIFIED_ATOMS_INFO.distance,
      ROUND,
      ROUND,
      {
        fill: FrictionConstants.TOP_BOOK_COLOR,
        cursor: 'pointer'
      }
    );

    const dragListener = new FrictionDragListener( model, temperatureIncreasingDescriber, temperatureDecreasingDescriber,
      bookMovementDescriber, options.tandem.createTandem( 'dragListener' ), {
        startSound: bookPickupSoundClip,
        endSound: bookDropSoundClip,
        targetNode: this.topBookBackground
      } );
    background.addInputListener( dragListener );
    this.topBookBackground.addChild( background );

    // init drag for drag area
    const dragArea = new Rectangle(
      0.055 * WIDTH,
      0.175 * HEIGHT,
      0.875 * WIDTH,
      FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY * 6, {
        fill: null,
        cursor: 'pointer',
        tandem: options.tandem.createTandem( 'atomDragArea' ),

        // pdom
        focusHighlightLayerable: true
      } );

    dragArea.addInputListener( dragListener );


    // add arrows before the drag area, then the grab cue hides the arrows
    this.topBookBackground.addChild( visualArrowIcon );

    this.topBookBackground.addChild( dragArea );

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

    // pdom - custom shape for the focus highlight, shape will change with atomRowsToEvaporateProperty
    const focusHighlightPath = new FocusHighlightPath( getFocusHighlightShape( dragArea ) );


    // pdom - add the focus highlight on top of the row circles
    // must be added prior to adding the grab/drag interaction
    this.topBookBackground.addChild( focusHighlightPath );
    dragArea.focusHighlight = focusHighlightPath; // this is a constraint of the grab/drag interaction, must be set before it's creation, but only for focusHighlightLayerable

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
    this.keyboardDragHandler = new FrictionKeyboardDragListener( model, temperatureIncreasingDescriber,
      temperatureDecreasingDescriber, bookMovementDescriber );

    // alert the temperature state on focus
    const focusListener = {
      focus() {
        if ( model.vibrationAmplitudeProperty.value === model.vibrationAmplitudeProperty.initialValue ) {
          FrictionAlertManager.alertSettledAndCool();
        }
      }
    };

    // pdom
    const grabDragInteraction = new FrictionGrabDragInteraction( model, this.keyboardDragHandler, dragArea, grabbedDescriber, {
      objectToGrabString: zoomedInChemistryBookString,
      tandem: options.tandem.createTandem( 'grabDragInteraction' ),
      grabCueOptions: {
        center: dragArea.center.minusXY( 0, 73 )
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

      dragCueNode: cueArrows,

      listenersForDragState: [ focusListener ]
    } );

    this.container.addChild( this.topBookBackground );

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

    // add observers
    model.hintProperty.linkAttribute( visualArrowIcon, 'visible' );
    model.topBookPositionProperty.linkAttribute( this.topBookBackground, 'translation' );
    model.topBookPositionProperty.linkAttribute( this.topAtomsLayer, 'translation' );

    model.atomRowsToEvaporateProperty.link( number => {

      // Adjust the drag area as the number of rows of atoms evaporates.
      dragArea.setRectHeight( ( number + 2 ) * FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY );

      // Update the size of the focus highlight accordingly
      focusHighlightPath.setShape( getFocusHighlightShape( dragArea ) );
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
      x: options.x + xSpacing * i
    } ) );
  }
}

/**
 *
 * @param {Node} dragArea
 * @returns {Shape}
 */
function getFocusHighlightShape( dragArea ) {
  return Shape.bounds( dragArea.bounds.withOffsets( 0, 40, 0, 0 ) );
}

Voicing.compose( MagnifierNode );

export default MagnifierNode;