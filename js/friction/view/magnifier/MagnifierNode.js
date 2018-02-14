// Copyright 2013-2018, University of Colorado Boulder

/**
 * Container that shows the entire magnification area
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var AtomCanvasNode = require( 'FRICTION/friction/view/magnifier/AtomCanvasNode' );
  var AtomNode = require( 'FRICTION/friction/view/magnifier/AtomNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DragHandler = require( 'FRICTION/friction/view/DragHandler' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var FrictionKeyboardDragHandler = require( 'FRICTION/friction/view/FrictionKeyboardDragHandler' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MagnifierTargetNode = require( 'FRICTION/friction/view/magnifier/MagnifierTargetNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Vector2 = require( 'DOT/Vector2' );

  // a11y strings
  var bookTitleStringPattern = FrictionA11yStrings.bookTitleStringPattern.value;
  var atomicViewBookTitleStringPattern = FrictionA11yStrings.atomicViewBookTitleStringPattern.value;

  // constants
  var ARROW_LENGTH = 70;
  var INTER_ARROW_SPACING = 20;
  var ARROW_OPTIONS = {

    // These values were empirically determined based on visual appearance.
    headHeight: 32,
    headWidth: 30,
    tailWidth: 15,
    fill: 'white',
    stroke: 'black',
    lineWidth: 2
  };

  var WIDTH = 690;
  var HEIGHT = 300;
  var ROUND = 30;
  var SCALE = 0.05;

  /**
   * @param {FrictionModel} model
   * @param {number} targetX - x position of the MagnifierTargetNode rectangle
   * @param {number} targetY - y position of the MagnifierTargetNode rectangle
   * @param {string} title - the title of the book that is draggable, used for a11y
   * @param {Object} [options]
   * @constructor
   */
  function MagnifierNode( model, targetX, targetY, title, options ) {
    Node.call( this, options );

    // @private
    this.topAtoms = {
      atoms: model.atoms.top,
      x: 50,
      y: HEIGHT / 3 - model.atoms.distance,

      // {Node}
      target: null
    };

    // @private
    this.bottomAtoms = {
      atoms: model.atoms.bottom,
      x: 50,
      y: 2 * HEIGHT / 3,

      // {Node}
      target: null
    };

    // add container for clipping
    this.container = new Node();
    this.addChild( this.container );

    // @private - container where the individual atoms will be placed
    this.bottomAtomsLayer = new Node();

    // @private - container where the individual atoms will be placed
    this.topAtomsLayer = new Node();

    // arrow icon
    var arrowIcon = new Node();
    arrowIcon.addChild( new ArrowNode( INTER_ARROW_SPACING / 2, 0, ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.addChild( new ArrowNode( -INTER_ARROW_SPACING / 2, 0, -ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.mutate( { centerX: WIDTH / 2, centerY: this.topAtoms.y / 2 } );

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
    this.addRowCircles( model, this.bottomBookBackground, {
      color: FrictionConstants.BOTTOM_BOOK_COLOR,
      x: -model.atoms.distanceX / 2,
      y: 2 * HEIGHT / 3 - 2,
      width: WIDTH
    } );
    this.bottomAtoms.target = this.bottomAtomsLayer;
    this.container.addChild( this.bottomBookBackground );

    // @private - add top book
    this.topBookBackground = new Node();

    // init drag for background
    var background = new Rectangle(
      -1.125 * WIDTH,
      -HEIGHT, 3.25 * WIDTH,
      4 * HEIGHT / 3 - model.atoms.distance,
      ROUND,
      ROUND, {
        fill: FrictionConstants.TOP_BOOK_COLOR,
        cursor: 'pointer'
      } );
    background.addInputListener( new DragHandler( model, options.tandem.createTandem( 'backgroundDragHandler' ) ) );
    this.topBookBackground.addChild( background );

    // init drag for drag area
    var dragArea = new Rectangle(
      0.055 * WIDTH,
      0.175 * HEIGHT,
      0.875 * WIDTH,
      model.atoms.distanceY * 6, {
        fill: null,
        cursor: 'pointer',

        // a11y - add accessibility to the rectangle that surrounds the top atoms.
        tagName: 'div',
        parentContainerAriaRole: 'application',
        parentContainerTagName: 'div',
        focusable: true,
        focusHighlightLayerable: true,
        prependLabels: true,

        // Add the accessibleLabel based on the name of the name of the book title.
        accessibleLabel: StringUtils.fillIn( atomicViewBookTitleStringPattern, {
          bookTitleString: StringUtils.fillIn( bookTitleStringPattern, {
            bookTitle: title
          } )
        } )
      } );
    dragArea.addInputListener( new DragHandler( model, options.tandem.createTandem( 'dragAreaDragHandler' ) ) );
    this.topBookBackground.addChild( dragArea );

    // this node's parent container is labelledby its label
    dragArea.setAriaLabelledByNode( dragArea );
    dragArea.setAriaLabelledContent( AccessiblePeer.PARENT_CONTAINER );

    // a11y - The focusHighlight of the top atoms. It also includes the place for the arrows so that it extends up into
    // the book "background." Dilated to get around the arrows fully. See `atomRowsToEvaporateProperty.link()` below
    var arrowAndTopAtomsForFocusHighlight = new Node();
    arrowAndTopAtomsForFocusHighlight.children = [ dragArea, Rectangle.bounds( arrowIcon.bounds.dilated( 3 ) ) ];

    // a11y - custom shape for the focus highlight, shape will change with atomRowsToEvaporateProperty
    var focusHighlightShape = Shape.bounds( dragArea.bounds );
    var focusHighlightPath = new FocusHighlightPath( focusHighlightShape );
    dragArea.setFocusHighlight( focusHighlightPath );

    // a11y - add the keyboard drag listener to the top atoms
    this.keyboardDragHandler = new FrictionKeyboardDragHandler( model );
    dragArea.addAccessibleInputListener( this.keyboardDragHandler );

    this.addRowCircles( model, this.topBookBackground, {
      color: FrictionConstants.TOP_BOOK_COLOR,
      x: -WIDTH,
      y: HEIGHT / 3 - model.atoms.distance,
      width: 3 * WIDTH
    } );
    this.topAtoms.target = this.topAtomsLayer;

    // a11y - add the focus highlight on top of the row circles
    this.topBookBackground.addChild( focusHighlightPath );

    this.container.addChild( this.topBookBackground );

    // Add the red border around the magnified area, and add a white shape below it to block out the clipped area.
    var topPadding = 500;
    var sidePadding = 800;
    var bottomPadding = 60;
    var rightX = WIDTH + sidePadding;
    var leftX = -sidePadding;
    var topY = -topPadding;
    var bottomY = HEIGHT + bottomPadding;
    var innerLowX = ROUND;
    var innerHighX = WIDTH - ROUND;
    var innerLowY = ROUND;
    var innerHighY = HEIGHT - ROUND;
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
    var magnifierTargetNode = new MagnifierTargetNode(
      targetX,
      targetY,
      WIDTH * SCALE,
      HEIGHT * SCALE,
      ROUND * SCALE,
      new Vector2( ROUND, HEIGHT ),
      new Vector2( WIDTH - ROUND, HEIGHT )
    );
    this.addChild( magnifierTargetNode );

    // add the arrow at the end
    this.container.addChild( arrowIcon );

    // @private - Add the canvas where the atoms will be rendered. NOTE: For better performance (particularly on iPad), we are
    // using CanvasNode to render the atoms instead of individual nodes. All atoms are displayed there, even though we
    // still create AtomNode view instances.
    this.atomCanvasNode = new AtomCanvasNode( {
      canvasBounds: new Bounds2( 0, 0, WIDTH, HEIGHT )
    } );
    this.container.addChild( this.atomCanvasNode );

    // add the atoms
    this.addAtoms( model );

    // add observers
    model.hintProperty.linkAttribute( arrowIcon, 'visible' );
    model.bookPositionProperty.linkAttribute( this.topBookBackground, 'translation' );
    model.bookPositionProperty.linkAttribute( this.topAtomsLayer, 'translation' );

    model.atomRowsToEvaporateProperty.link( function( number ) {

      // Adjust the drag area as the number of rows of atoms evaporates.
      dragArea.setRectHeight( ( number + 2 ) * model.atoms.distanceY );

      // Update the size of the focus highlight accordingly
      focusHighlightPath.setShape( Shape.bounds( arrowAndTopAtomsForFocusHighlight.bounds ) );
    } );
  }

  friction.register( 'MagnifierNode', MagnifierNode );

  return inherit( Node, MagnifierNode, {

    /**
     * Move forward in time
     * @param {number} dt - seconds
     * @public
     */
    step: function( dt ) {
      this.atomCanvasNode.invalidatePaint(); // tell the atom canvas to redraw itself
    },

    /**
     * Add the layers of atoms to the view *and* to the model.
     * @param {FrictionModel} model
     * @private
     */
    addAtoms: function( model ) {
      var self = this;
      var topAtoms = this.topAtoms;
      var bottomAtoms = this.bottomAtoms;
      var dx = model.atoms.distanceX;
      var dy = model.atoms.distanceY;

      /**
       * @param {Node} target
       * @param {Object[]} layer
       * @param {number} x - origin in x coordinate
       * @param {number} y - origin in y coordinate
       * @param {string} color - this must be a string because it indexes into an object.
       */
      var addLayer = function( target, layer, x, y, color ) {

        assert && assert( typeof color === 'string', 'Color should be a string' );

        var evaporate;
        var row = [];

        for ( var i = 0; i < layer.length; i++ ) {
          var offset = layer[ i ].offset || 0;
          evaporate = layer[ i ].evaporate || false;
          for ( var n = 0; n < layer[ i ].num; n++ ) {
            var atomNode = new AtomNode( model, { y: y, x: x + ( offset + n ) * dx, color: color } );
            if ( evaporate ) {
              row.push( atomNode );
            }
            self.atomCanvasNode.registerAtom( atomNode );
          }
        }
        if ( evaporate ) {
          model.toEvaporateSample.push( row );
        }
      };

      // add top atoms
      topAtoms.atoms.layers.forEach( function( layer, i ) {
        addLayer( topAtoms.target, layer, topAtoms.x, topAtoms.y + dy * i, topAtoms.atoms.color );
      } );

      // add bottom atoms
      bottomAtoms.atoms.layers.forEach( function( layer, i ) {
        addLayer( bottomAtoms.target, layer, self.bottomAtoms.x, self.bottomAtoms.y + dy * i, bottomAtoms.atoms.color );
      } );
    },

    /**
     * Add a row of atoms
     * @param {FrictionModel} model
     * @param {Node} target
     * @param {Node} target
     * @param {Object} [options]
     * @private
     */
    addRowCircles: function( model, target, options ) {
      var numberOfAtomsForRow = options.width / model.atoms.distanceX;
      for ( var i = 0; i < numberOfAtomsForRow; i++ ) {
        target.addChild( new Circle( model.atoms.radius, {
          fill: options.color,
          y: options.y,
          x: options.x + model.atoms.distanceX * i
        } ) );
      }
    }
  } );
} );