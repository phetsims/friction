// Copyright 2013-2018, University of Colorado Boulder

/**
 * Container for magnifier
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccessiblePeer = require( 'SCENERY/accessibility/AccessiblePeer' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var AtomNode = require( 'FRICTION/friction/view/magnifier/AtomNode' );
  var AtomCanvasNode = require( 'FRICTION/friction/view/magnifier/AtomCanvasNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var FocusHighlightPath = require( 'SCENERY/accessibility/FocusHighlightPath' );
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var FrictionKeyboardDragHandler = require( 'FRICTION/friction/view/FrictionKeyboardDragHandler' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
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

  /**
   * @param model
   * @param {Object} [options]
   * @constructor
   */

  /**
   *
   * @param {FrictionModel} model
   * @param {number} x
   * @param {number} y
   * @param {number} targetX
   * @param {number} targetY
   * @param {string} title -  the title of the book that is draggable, used for a11y
   * @param {Object} options
   * @constructor
   */
  function MagnifierNode( model, x, y, targetX, targetY, title, options ) {

    options = _.extend( {
      x: x,
      y: y
    }, options );

    Node.call( this, options );

    // main params
    this.param = {
      width: 690,
      height: 300,
      round: 30,
      scale: 0.05,
      topAtoms: {
        atoms: model.atoms.top,
        x: 50,

        // {Node}
        target: null
      },
      bottomAtoms: {
        atoms: model.atoms.bottom,
        x: 50,

        // {Node}
        target: null
      }
    };
    this.param.topAtoms.y = this.param.height / 3 - model.atoms.distance;
    this.param.bottomAtoms.y = 2 * this.param.height / 3;


    // add container for clipping
    this.addChild( this.container = new Node() );

    // add container where the individual atoms will be placed
    this.bottomAtomsLayer = new Node();
    this.topAtomsLayer = new Node();

    // arrow icon
    var arrowIcon = new Node();
    arrowIcon.addChild( new ArrowNode( INTER_ARROW_SPACING / 2, 0, ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.addChild( new ArrowNode( -INTER_ARROW_SPACING / 2, 0, -ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.mutate( { centerX: this.param.width / 2, centerY: this.param.topAtoms.y / 2 } );

    // add bottom book
    this.bottomBookBackground = new Node( {
      children: [
        new Rectangle(
          3,
          2 * this.param.height / 3 - 2,
          this.param.width - 6,
          this.param.height / 3,
          0,
          this.param.round - 3,
          { fill: FrictionSharedConstants.BOTTOM_BOOK_COLOR }
        )
      ]
    } );
    this.addRowCircles( model, this.bottomBookBackground, {
      color: FrictionSharedConstants.BOTTOM_BOOK_COLOR,
      x: -model.atoms.distanceX / 2,
      y: 2 * this.param.height / 3 - 2,
      width: this.param.width
    } );
    this.param.bottomAtoms.target = this.bottomAtomsLayer;
    this.container.addChild( this.bottomBookBackground );

    // add top book
    this.topBookBackground = new Node();

    // init drag for background
    var background = new Rectangle(
      -1.125 * this.param.width,
      -this.param.height, 3.25 * this.param.width,
      4 * this.param.height / 3 - model.atoms.distance,
      this.param.round,
      this.param.round, {
        fill: FrictionSharedConstants.TOP_BOOK_COLOR
      } );
    model.initDrag( background );
    this.topBookBackground.addChild( background );

    // init drag for drag area
    var dragArea = new Rectangle( 0.055 * this.param.width, 0.175 * this.param.height, 0.875 * this.param.width, model.atoms.distanceY * 6, {
      fill: null,

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
    model.initDrag( dragArea );
    this.topBookBackground.addChild( dragArea );

    // this node's parent container is labelledby its label
    dragArea.setAriaLabelledByNode( dragArea );
    dragArea.setAriaLabelledContent( AccessiblePeer.PARENT_CONTAINER );

    // a11y - The focusHighlight of the top atoms. It also includes the place for the arrows so that it extends up into the
    // book "background." Dilated to get around the arrows fully. See `atomRowsToEvaporateProperty.link()` below
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
      color: FrictionSharedConstants.TOP_BOOK_COLOR,
      x: -this.param.width,
      y: this.param.height / 3 - model.atoms.distance,
      width: 3 * this.param.width
    } );
    this.param.topAtoms.target = this.topAtomsLayer;

    // a11y - add the focus highlight on top of the row circles
    this.topBookBackground.addChild( focusHighlightPath );

    this.container.addChild( this.topBookBackground );

    // Add the red border around the magnified area, and add a white shape below it to block out the clipped area.
    var topPadding = 500;
    var sidePadding = 800;
    var bottomPadding = 60;
    var rightX = this.param.width + sidePadding;
    var leftX = -sidePadding;
    var topY = -topPadding;
    var bottomY = this.param.height + bottomPadding;
    var innerLowX = this.param.round;
    var innerHighX = this.param.width - this.param.round;
    var innerLowY = this.param.round;
    var innerHighY = this.param.height - this.param.round;
    this.addChild( new Path( new Shape().moveTo( rightX, topY )
        .lineTo( leftX, topY )
        .lineTo( leftX, bottomY )
        .lineTo( rightX, bottomY )
        .lineTo( rightX, topY )
        .lineTo( innerHighX, innerLowY - this.param.round )
        .arc( innerHighX, innerLowY, this.param.round, -Math.PI / 2, 0, false )
        .arc( innerHighX, innerHighY, this.param.round, 0, Math.PI / 2, false )
        .arc( innerLowX, innerHighY, this.param.round, Math.PI / 2, Math.PI, false )
        .arc( innerLowX, innerLowY, this.param.round, Math.PI, Math.PI * 3 / 2, false )
        .lineTo( innerHighX, innerLowY - this.param.round )
        .close(),
      { fill: 'white' } ) );

    // add the containing border rectangle
    this.addChild( new Rectangle( 0, 0, this.param.width, this.param.height, this.param.round, this.param.round, {
      stroke: 'black',
      lineWidth: 5
    } ) );

    // add magnifier's target
    this.target = new MagnifierTargetNode(
      targetX,
      targetY,
      this.param.width * this.param.scale,
      this.param.height * this.param.scale,
      this.param.round * this.param.scale,
      new Vector2( this.param.round, this.param.height ),
      new Vector2( this.param.width - this.param.round, this.param.height )
    );
    this.addChild( this.target );

    // add the arrow at the end
    this.container.addChild( arrowIcon );

    // Add the canvas where the atoms will be rendered. NOTE: For better performance (particularly on iPad), we are
    // using CanvasNode to render the atoms instead of individual nodes. All atoms are displayed there, even though we
    // still create AtomNode view instances.
    this.atomCanvasNode = new AtomCanvasNode( model.positionProperty, {
      canvasBounds: new Bounds2( 0, 0, this.param.width, this.param.height )
    } );
    this.container.addChild( this.atomCanvasNode );

    // add the atoms
    this.addAtoms( model );

    // add observers
    model.hintProperty.linkAttribute( arrowIcon, 'visible' );
    model.positionProperty.linkAttribute( this.topBookBackground, 'translation' );
    model.positionProperty.linkAttribute( this.topAtomsLayer, 'translation' );

    model.atomRowsToEvaporateProperty.link( function( number ) {

      // Adjust the drag area as the number of rows of atoms evaporates.
      dragArea.setRectHeight( ( number + 2 ) * model.atoms.distanceY );

      // Update the size of the focus highlight accordingly
      focusHighlightPath.setShape( Shape.bounds( arrowAndTopAtomsForFocusHighlight.bounds ) );
    } );
  }

  friction.register( 'MagnifierNode', MagnifierNode );

  return inherit( Node, MagnifierNode, {

    step: function( dt ) {
      this.atomCanvasNode.invalidatePaint(); // tell the atom canvas to redraw itself
      this.keyboardDragHandler.step( dt ); // a11y
    },

    addAtoms: function( model ) {
      var self = this;
      var topAtoms = this.param.topAtoms;
      var bottomAtoms = this.param.bottomAtoms;
      var dx = model.atoms.distanceX;
      var dy = model.atoms.distanceY;
      var color;
      var y0;
      var x0;
      var target;

      // add one layer of atoms
      var addLayer = function( target, layer, y, x, color ) {
        var i;
        var n;
        var offset;
        var evaporate;
        var atom;
        var row = [];

        for ( i = 0; i < layer.length; i++ ) {
          offset = layer[ i ].offset || 0;
          evaporate = layer[ i ].evaporate || false;
          for ( n = 0; n < layer[ i ].num; n++ ) {
            atom = new AtomNode( model, { y: y, x: x + ( offset + n ) * dx, color: color } );
            if ( evaporate ) {
              row.push( atom );
            }
            self.atomCanvasNode.registerAtom( atom );
          }
        }
        if ( evaporate ) {
          model.toEvaporateSample.push( row );
        }
      };

      // add top atoms
      color = topAtoms.atoms.color;
      y0 = topAtoms.y;
      x0 = topAtoms.x;
      target = topAtoms.target;
      topAtoms.atoms.layers.forEach( function( layer, i ) {
        addLayer( target, layer, y0 + dy * i, x0, color );
      } );

      // add bottom atoms
      color = bottomAtoms.atoms.color;
      y0 = self.param.bottomAtoms.y;
      x0 = self.param.bottomAtoms.x;
      target = bottomAtoms.target;
      bottomAtoms.atoms.layers.forEach( function( layer, i ) {
        addLayer( target, layer, y0 + dy * i, x0, color );
      } );
    },

    /**
     * Add a row of atoms
     * @param {FrictionModel} model
     * @param {Node} target
     * @param {Node} target
     * @param {Object} options
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
