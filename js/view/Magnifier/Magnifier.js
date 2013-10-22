/**
 * Copyright 2002-2013, University of Colorado
 * Container for magnifier
 *
 * @author Andrey Zelenkov (Mlearner)
 */


define( function( require ) {
  'use strict';
  var Node = require( 'SCENERY/nodes/Node' );
  var inherit = require( 'PHET_CORE/inherit' );

  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Circle = require( 'SCENERY/nodes/Circle' );

  var rubAtomsString = require( 'string!FRICTION/rubAtoms' );

  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FONT = new PhetFont( 30 );

  var Atom = require( 'view/Magnifier/Atom' );
  var MagnifierTarget = require( 'view/Magnifier/MagnifierTarget' );

  function Magnifier( model, options ) {
    var self = this;
    Node.call( this, {x: options.x, y: options.y} );

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

    // add border
    this.addChild( new Rectangle( 0, 0, this.param.width, this.param.height, this.param.round, this.param.round, {stroke: 'red', lineWidth: 5} ) );

    // add container for clipping
    this.addChild( this.container = new Node() );
    this.container.setClipArea( new Shape().roundRect( 2.5, 2.5, this.param.width - 5, this.param.height - 5, this.param.round, this.param.round ) );

    // add top book
    this.topBook = new Node( {children: [
      new Rectangle( -1.125 * this.param.width, -this.param.height, 3.25 * this.param.width, 4 * this.param.height / 3 - model.atoms.distance, this.param.round, this.param.round, {fill: 'yellow'} )
    ]} );
    this.addRowCircles( model, this.topBook, {color: 'yellow', x: -this.param.width, y: this.param.height / 3 - model.atoms.distance, width: 3 * this.param.width} );
    this.param.topAtoms.target = this.topBook;
    this.container.addChild( this.topBook );

    // add bottom book
    this.bottomBook = new Node( {children: [
      new Rectangle( 3, 2 * this.param.height / 3 - 2, this.param.width - 6, this.param.height / 3, 0, this.param.round - 3, {fill: 'rgb(187,255,187)'} ),
      new Rectangle( 3, 2 * this.param.height / 3 - 2, this.param.width - 6, this.param.round, {fill: 'rgb(187,255,187)'} )
    ]} );
    this.addRowCircles( model, this.bottomBook, {color: 'rgb(187,255,187)', x: -model.atoms.dx / 2, y: 2 * this.param.height / 3 - 2, width: this.param.width} );
    this.param.bottomAtoms.target = this.bottomBook;
    this.container.addChild( this.bottomBook );

    // add magnifier's target
    this.target = new MagnifierTarget( model, {
      x: options.targetX,
      y: options.targetY,
      width: this.param.width * this.param.scale,
      height: this.param.height * this.param.scale,
      round: this.param.round * this.param.scale,
      leftAnchor: {x: this.param.round, y: this.param.height},
      rightAnchor: {x: this.param.width - this.param.round, y: this.param.height}
    } );
    this.addChild( this.target );

    // header text
    var text = new Text( rubAtomsString, { font: FONT, fill: 'red', pickable: false, y: this.param.height / 7} );
    text.x = (this.param.width - text.getWidth()) / 2;
    this.container.addChild( text );

    // add atoms
    this.addAtoms( model );

    // init drag
    model.initDrag( this.topBook );

    // add observers
    model.hintProperty.link( function( flag ) {
      text.setVisible( flag );
    } );

    model.positionProperty.link( function( v ) {
      self.topBook.setX( v.x );
      self.topBook.setY( v.y );
    } );
  }

  inherit( Node, Magnifier );

  Magnifier.prototype.addAtoms = function( model ) {
    var self = this,
      topAtoms = this.param.topAtoms,
      bottomAtoms = this.param.bottomAtoms,
      dx = model.atoms.dx,
      dy = model.atoms.dy,
      color, y0, x0, target;

    // add one layer of atoms
    var addLayer = function( target, layer, y, x, color ) {
      var i, n, offset, evaporate, atom, row = [];
      for ( i = 0; i < layer.length; i++ ) {
        offset = layer[i].offset || 0;
        evaporate = layer[i].evaporate || false;
        for ( n = 0; n < layer[i].num; n++ ) {
          atom = new Atom( model, {y: y, x: x + (offset + n) * dx, color: color} );
          if ( evaporate ) {
            row.push( atom );
          }
          target.addChild( atom );
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
  };

  Magnifier.prototype.addRowCircles = function( model, target, options ) {
    var num = options.width / model.atoms.dx;
    for ( var i = 0; i < num; i++ ) {
      target.addChild( new Circle( model.atoms.radius, {
        fill: options.color,
        y: options.y,
        x: options.x + model.atoms.dx * i
      } ) );
    }
  };

  return Magnifier;
} );