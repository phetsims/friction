// Copyright 2013-2018, University of Colorado Boulder

/**
 * a Scenery Node that depicts the magnified area between the two books where the atoms can be seen
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const AtomCanvasNode = require( 'FRICTION/friction/view/magnifier/AtomCanvasNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const CueArrow = require( 'FRICTION/friction/view/CueArrow' );
  const FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yGrabDragNode = require( 'FRICTION/friction/view/FrictionA11yGrabDragNode' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionDragHandler = require( 'FRICTION/friction/view/FrictionDragHandler' );
  const FrictionKeyboardDragListener = require( 'FRICTION/friction/view/FrictionKeyboardDragListener' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MagnifierTargetNode = require( 'FRICTION/friction/view/magnifier/MagnifierTargetNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const SoundClip = require( 'TAMBO/sound-generators/SoundClip' );
  const soundManager = require( 'TAMBO/soundManager' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Vector2 = require( 'DOT/Vector2' );

  // a11y strings
  let bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;
  let zoomedInBookTitlePatternString = FrictionA11yStrings.zoomedInBookTitlePattern.value;
  let zoomedInString = FrictionA11yStrings.zoomedIn.value;
  let zoomedInChemistryBookPatternString = FrictionA11yStrings.zoomedInChemistryBookPattern.value;

  // sounds
  const harpDropSound = require( 'sound!FRICTION/harp-drop.mp3' );
  const harpPickupSound = require( 'sound!FRICTION/harp-pickup.mp3' );

  // constants
  let WIDTH = FrictionConstants.MAGNIFIER_WINDOW_WIDTH;
  let HEIGHT = FrictionConstants.MAGNIFIER_WINDOW_HEIGHT;
  let ROUND = 30;
  let SCALE = 0.05;
  let SOUND_LEVEL = 0.1; // TODO: Ashton - level for magnified book pickup and drop, review and modify if needed
  let ARROW_TOP = 22;

  /**
   * @param {FrictionModel} model
   * @param {number} targetX - x position of the MagnifierTargetNode rectangle
   * @param {number} targetY - y position of the MagnifierTargetNode rectangle
   * @param {string} title - the title of the book that is draggable, used for a11y
   * @param {Tandem} tandem - passed to the dragArea to instrument the focusable item as the magnifier, see https://github.com/phetsims/friction/issues/82
   * @param {Object} [options]
   * @constructor
   */
  function MagnifierNode( model, targetX, targetY, title, tandem, options ) {
    Node.call( this, options );

    // add container for clipping
    this.container = new Node();
    this.addChild( this.container );

    // @private - container where the individual atoms will be placed
    this.topAtomsLayer = new Node();

    // arrow icon
    let leftArrow = new CueArrow( { rotation: Math.PI, fill: 'white' } );
    let rightArrow = new CueArrow( { fill: 'white' } );
    let visualArrowIcon = new HBox( {
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
    let background = new Rectangle(
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
    background.addInputListener( new FrictionDragHandler( model, tandem.createTandem( 'backgroundDragHandler' ), {
      startSound: bookPickupSoundClip,
      endSound: bookDropSoundClip
    } ) );
    this.topBookBackground.addChild( background );

    // init drag for drag area
    let zoomedInTitle = StringUtils.fillIn( zoomedInBookTitlePatternString, {
      bookTitleString: StringUtils.fillIn( bookTitleStringPattern, {
        bookTitle: title
      } )
    } );
    let dragArea = new Rectangle(
      0.055 * WIDTH,
      0.175 * HEIGHT,
      0.875 * WIDTH,
      FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY * 6, {
        fill: null,
        cursor: 'pointer',
        tandem: tandem
      } );

    dragArea.addInputListener( new FrictionDragHandler( model, tandem.createTandem( 'dragAreaDragHandler' ), {
      startSound: bookPickupSoundClip,
      endSound: bookDropSoundClip
    } ) );

    // a11y - custom shape for the focus highlight, shape will change with atomRowsToEvaporateProperty
    let focusHighlightPath = new FocusHighlightPath( getFocusHighlightShape( dragArea ) );

    // cuing arrows for the book
    const bookCueArrowLeft = new CueArrow( {
      rotation: Math.PI
    } );
    const bookCueArrowRight = new CueArrow();

    let horizontalCueArrows = new HBox( {
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
      scale: .6,
      centerX: WIDTH / 2,
      top: ARROW_TOP
    } );

    // a11y - add the keyboard drag listener to the top atoms
    this.keyboardDragHandler = new FrictionKeyboardDragListener( model );

    // alert the temperature state on focus
    let focusListener = {
      focus() {
        if ( model.amplitudeProperty.value === model.amplitudeProperty.initialValue ) {
          FrictionAlertManager.alertSettledAndCool();
        }
      }
    };

    // a11y
    var a11yGrabDragInteractionNode = new FrictionA11yGrabDragNode( model, dragArea, {
      thingToGrab: StringUtils.fillIn( zoomedInChemistryBookPatternString, { zoomedIn: zoomedInString } ),
      tandem: tandem.createTandem( 'magnifierNodeGrabButton' ),
      grabCueOptions: {
        center: dragArea.center.minusXY( 0, 73 )
      },
      grabButtonOptions: {
        focusHighlight: focusHighlightPath,
        focusHighlightLayerable: true// TODO: ??

      },

      // Hide the visual cue arrows
      onGrab: () => { model.hintProperty.set( false ); },

      dragCueNode: cueArrows,

      // a11y - add accessibility to the rectangle that surrounds the top atoms.

      dragDivOptions: {
        // Add the Accessible Name based on the name of the name of the book title.
        ariaLabel: zoomedInTitle,
        innerContent: zoomedInTitle,
        focusHighlightLayerable: true // TODO: needed?

      },

      listenersForDrag: [ this.keyboardDragHandler, focusListener ]
    } );

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

    // a11y - add the focus highlight on top of the row circles
    this.topBookBackground.addChild( focusHighlightPath );

    this.container.addChild( this.topBookBackground );

    // Add the red border around the magnified area, and add a white shape below it to block out the clipped area.
    let topPadding = 500;
    let sidePadding = 800;
    let bottomPadding = 10; // don't go too far below the magnifier
    let rightX = WIDTH + sidePadding;
    let leftX = -sidePadding;
    let topY = -topPadding;
    let bottomY = HEIGHT + bottomPadding;
    let innerLowX = ROUND;
    let innerHighX = WIDTH - ROUND;
    let innerLowY = ROUND;
    let innerHighY = HEIGHT - ROUND;
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
      fill: 'white'
    } ) );

    // add the containing border rectangle
    this.addChild( new Rectangle( 0, 0, WIDTH, HEIGHT, ROUND, ROUND, {
      stroke: 'black',
      lineWidth: 5
    } ) );

    // add magnifier's target
    let magnifierTargetNode = new MagnifierTargetNode(
      targetX,
      targetY,
      WIDTH * SCALE,
      HEIGHT * SCALE,
      ROUND * SCALE,
      new Vector2( ROUND, HEIGHT ),
      new Vector2( WIDTH - ROUND, HEIGHT ),
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

    model.atomRowsToEvaporateProperty.link( function( number ) {

      // Adjust the drag area as the number of rows of atoms evaporates.
      dragArea.setRectHeight( ( number + 2 ) * FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY );

      // Update the size of the focus highlight accordingly
      focusHighlightPath.setShape( getFocusHighlightShape( dragArea ) );
    } );

    // @private
    this.resetMagnifierNode = function() {
      a11yGrabDragInteractionNode.reset();
    };
  }

  friction.register( 'MagnifierNode', MagnifierNode );

  // helper function that adds a row of circles at the specified location, used to add bumps to the magnified books
  function addRowCircles( circleRadius, xSpacing, parentNode, options ) {
    let numberOfAtomsForRow = options.width / xSpacing;
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

  return inherit( Node, MagnifierNode, {

    /**
     * move forward in time
     * @public
     */
    step: function() {
      this.atomCanvasNode.invalidatePaint(); // tell the atom canvas to redraw itself on every step
    },

    /**
     * @public
     */
    reset: function() {
      this.resetMagnifierNode();
    }

  } );
} );