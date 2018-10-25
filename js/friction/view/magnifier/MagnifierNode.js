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
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const AtomCanvasNode = require( 'FRICTION/friction/view/magnifier/AtomCanvasNode' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionDragHandler = require( 'FRICTION/friction/view/FrictionDragHandler' );
  const FrictionKeyboardDragListener = require( 'FRICTION/friction/view/FrictionKeyboardDragListener' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MagnifierTargetNode = require( 'FRICTION/friction/view/magnifier/MagnifierTargetNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Vector2 = require( 'DOT/Vector2' );

  // a11y strings
  let bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;
  let zoomedInBookTitlePatternString = FrictionA11yStrings.zoomedInBookTitlePattern.value;
  let moveInFourDirectionsString = FrictionA11yStrings.moveInFourDirections.value;

  // constants
  let ARROW_LENGTH = 70;
  let INTER_ARROW_SPACING = 20;
  let ARROW_OPTIONS = {

    // these values were empirically determined based on visual appearance
    headHeight: 32,
    headWidth: 30,
    tailWidth: 15,
    fill: 'white',
    stroke: 'black',
    lineWidth: 2
  };

  let WIDTH = FrictionConstants.MAGNIFIER_WINDOW_WIDTH;
  let HEIGHT = FrictionConstants.MAGNIFIER_WINDOW_HEIGHT;
  let ROUND = 30;
  let SCALE = 0.05;

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
    let arrowIcon = new Node();
    arrowIcon.addChild( new ArrowNode( INTER_ARROW_SPACING / 2, 0, ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.addChild( new ArrowNode( -INTER_ARROW_SPACING / 2, 0, -ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.mutate( { centerX: WIDTH / 2, top: 20 } );

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
      ROUND, {
        fill: FrictionConstants.TOP_BOOK_COLOR,
        cursor: 'pointer'
      } );
    background.addInputListener( new FrictionDragHandler( model, tandem.createTandem( 'backgroundDragHandler' ) ) );
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
        tandem: tandem,

        // a11y - add accessibility to the rectangle that surrounds the top atoms.
        tagName: 'div',
        ariaRole: 'application',
        focusable: true,
        focusHighlightLayerable: true,

        // Add the Accessible Name based on the name of the name of the book title.
        ariaLabel: zoomedInTitle,
        innerContent: zoomedInTitle
      } );

    dragArea.setAccessibleAttribute( 'aria-roledescription', moveInFourDirectionsString );

    dragArea.addInputListener( new FrictionDragHandler( model, tandem.createTandem( 'dragAreaDragHandler' ) ) );
    this.topBookBackground.addChild( dragArea );

    // a11y - The focusHighlight of the top atoms. It also includes the place for the arrows so that it extends up into
    // the book "background." Dilated to get around the arrows fully. See `atomRowsToEvaporateProperty.link()` below
    let arrowAndTopAtomsForFocusHighlight = new Node();
    arrowAndTopAtomsForFocusHighlight.children = [ dragArea, Rectangle.bounds( arrowIcon.bounds.dilated( 3 ) ) ];

    // a11y - custom shape for the focus highlight, shape will change with atomRowsToEvaporateProperty
    let focusHighlightShape = Shape.bounds( dragArea.bounds );
    let focusHighlightPath = new FocusHighlightPath( focusHighlightShape );
    dragArea.setFocusHighlight( focusHighlightPath );

    // a11y - add the keyboard drag listener to the top atoms
    this.keyboardDragHandler = new FrictionKeyboardDragListener( model );
    dragArea.addAccessibleInputListener( this.keyboardDragHandler );

    // alert the temperature state on focus
    dragArea.addAccessibleInputListener( {
      focus() {
        if ( model.amplitudeProperty.value === model.amplitudeProperty.initialValue ) {
          FrictionAlertManager.alertSettledAndCool();
        }
      }
    } );

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
    let bottomPadding = 60;
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

    // add the arrow at the end
    this.container.addChild( arrowIcon );

    // @private - Add the canvas where the atoms will be rendered. For better performance, particularly on iPad, we are
    // using CanvasNode to render the atoms instead of individual nodes.
    this.atomCanvasNode = new AtomCanvasNode( model.atoms, {
      canvasBounds: new Bounds2( 0, 0, WIDTH, HEIGHT )
    } );
    this.container.addChild( this.atomCanvasNode );

    // add observers
    model.hintProperty.linkAttribute( arrowIcon, 'visible' );
    model.topBookPositionProperty.linkAttribute( this.topBookBackground, 'translation' );
    model.topBookPositionProperty.linkAttribute( this.topAtomsLayer, 'translation' );

    model.atomRowsToEvaporateProperty.link( function( number ) {

      // Adjust the drag area as the number of rows of atoms evaporates.
      dragArea.setRectHeight( ( number + 2 ) * FrictionModel.MAGNIFIED_ATOMS_INFO.distanceY );

      // Update the size of the focus highlight accordingly
      focusHighlightPath.setShape( Shape.bounds( arrowAndTopAtomsForFocusHighlight.bounds ) );
    } );
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

  return inherit( Node, MagnifierNode, {

    /**
     * move forward in time
     * @public
     */
    step: function() {
      this.atomCanvasNode.invalidatePaint(); // tell the atom canvas to redraw itself on every step
    }

  } );
} );