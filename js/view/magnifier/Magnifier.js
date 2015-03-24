// Copyright 2002-2013, University of Colorado Boulder

/**
 * Container for magnifier
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Atom = require( 'FRICTION/view/magnifier/Atom' );
  var AtomCanvas = require( 'FRICTION/view/magnifier/AtomCanvas' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var FrictionSharedConstants = require( 'FRICTION/common/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var MagnifierTarget = require( 'FRICTION/view/magnifier/MagnifierTarget' );

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
  function Magnifier( model, options ) {

    Node.call( this, options );

    var self = this;
    var arrowIcon;
    var dragArea;
    var background;

    // main params
    this.param = {
      width: 690,
      height: 300,
      round: 30,
      scale: 0.05,
      topAtoms: {
        atoms: model.atoms.top,
        y: 100 - model.atoms.distance,
        x: 50,
        target: null
      },
      bottomAtoms: {
        atoms: model.atoms.bottom,
        x: 50,
        y: 200,
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

    // add bottom book
    this.bottomBookBackground = new Node( {
      children: [
        new Rectangle( 3, 2 * this.param.height / 3 - 2, this.param.width - 6, this.param.height / 3, 0, this.param.round - 3, { fill: FrictionSharedConstants.BOTTOM_BOOK_ATOMS_COLOR } )
      ]
    } );
    this.addRowCircles( model, this.bottomBookBackground, {
      color: FrictionSharedConstants.BOTTOM_BOOK_ATOMS_COLOR,
      x: -model.atoms.dx / 2,
      y: 2 * this.param.height / 3 - 2,
      width: this.param.width
    } );
    this.param.bottomAtoms.target = this.bottomAtomsLayer;
    this.container.addChild( this.bottomBookBackground );

    // add top book
    this.topBookBackground = new Node( { renderer: 'svg' } );

    // init drag for background
    background = new Rectangle( -1.125 * this.param.width, -this.param.height, 3.25 * this.param.width, 4 * this.param.height / 3 - model.atoms.distance, this.param.round, this.param.round, { fill: FrictionSharedConstants.TOP_BOOK_ATOMS_COLOR } );
    model.initDrag( background );
    this.topBookBackground.addChild( background );

    // init drag for drag area
    dragArea = new Rectangle( 0.055 * this.param.width, 0.175 * this.param.height, 0.875 * this.param.width, model.atoms.dy * 6, { fill: null } );
    model.initDrag( dragArea );
    this.topBookBackground.addChild( dragArea );

    this.addRowCircles( model, this.topBookBackground, {
      color: FrictionSharedConstants.TOP_BOOK_ATOMS_COLOR,
      x: -this.param.width,
      y:     this.param.height / 3 - model.atoms.distance,
      width: 3 * this.param.width
    } );
    this.param.topAtoms.target = this.topAtomsLayer;
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
    this.addChild( new Rectangle( 0, 0, this.param.width, this.param.height, this.param.round, this.param.round, { stroke: 'red', lineWidth: 5 } ) );

    // add magnifier's target
    this.target = new MagnifierTarget( {
      x: options.targetX,
      y: options.targetY,
      width: this.param.width * this.param.scale,
      height: this.param.height * this.param.scale,
      round: this.param.round * this.param.scale,
      leftAnchor: { x: this.param.round, y: this.param.height },
      rightAnchor: { x: this.param.width - this.param.round, y: this.param.height }
    } );
    this.addChild( this.target );

    // arrow icon
    arrowIcon = new Node();
    arrowIcon.addChild( new ArrowNode( INTER_ARROW_SPACING / 2, 0, ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.addChild( new ArrowNode( -INTER_ARROW_SPACING / 2, 0, -ARROW_LENGTH, 0, ARROW_OPTIONS ) );
    arrowIcon.mutate( { centerX: this.param.width / 2, centerY: this.param.topAtoms.y / 2 } );
    this.container.addChild( arrowIcon );

    // add atoms (on a separate layer for better performance).
    this.atomCanvasLayer = new AtomCanvas( this.param.width, this.param.height, model.positionProperty );
    this.addAtoms( model );
    // NOTE: For better performance (particularly on iPad), we are using the
    // AtomCanvas instead of an atom layer. All atoms are displayed there,
    // even though we still create Atom view instances.
    this.container.addChild( this.atomCanvasLayer );

    // add observers
    model.hintProperty.linkAttribute( arrowIcon, 'visible' );
    model.positionProperty.linkAttribute( self.topBookBackground, 'translation' );
    model.positionProperty.linkAttribute( self.topAtomsLayer, 'translation' );

    model.atomRowsToEvaporateProperty.link( function( number ) {
      dragArea.setRectHeight( (number + 2) * model.atoms.dy );
    } );
  }

  return inherit( Node, Magnifier, {
    step: function( timeElapsed ) {
      this.atomCanvasLayer.step( timeElapsed );
    },

    layout: function() {
      this.atomCanvasLayer.layout();
    },

    addAtoms: function( model ) {
      var self = this,
        topAtoms = this.param.topAtoms,
        bottomAtoms = this.param.bottomAtoms,
        dx = model.atoms.dx,
        dy = model.atoms.dy,
        color,
        y0,
        x0,
        target;

      // add one layer of atoms
      var addLayer = function( target, layer, y, x, color ) {
        var i,
          n,
          offset,
          evaporate,
          atom,
          row = [];

        for ( i = 0; i < layer.length; i++ ) {
          offset = layer[ i ].offset || 0;
          evaporate = layer[ i ].evaporate || false;
          for ( n = 0; n < layer[ i ].num; n++ ) {
            atom = new Atom( model, { y: y, x: x + (offset + n) * dx, color: color } );
            if ( evaporate ) {
              row.push( atom );
            }
            self.atomCanvasLayer.registerAtom( atom );
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

    addRowCircles: function( model, target, options ) {
      var num = options.width / model.atoms.dx;
      for ( var i = 0; i < num; i++ ) {
        target.addChild( new Circle( model.atoms.radius, {
          fill: options.color,
          y: options.y,
          x: options.x + model.atoms.dx * i
        } ) );
      }
    }
  } );
} );
