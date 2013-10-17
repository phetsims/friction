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
  var Path = require( 'SCENERY/nodes/Path' );

  var rubAtomsString = require( 'string!FRICTION/rubAtoms' );

  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FONT = new PhetFont( 30 );

  var Atom = require( 'view/Magnifier/Atom' );
  var MagnifierTarget = require( 'view/Magnifier/MagnifierTarget' );

  function Magnifier( model, options ) {
    Node.call( this, {x: options.x, y: options.y} );

    // main params
    this.param = {
      width: 690,
      height: 300,
      round: 30,
      scale: 0.05,
      radius: 7,
      dx: 20,
      dy: 20,
      topAtoms: {
        atoms: model.atoms.top,
        y: 75,
        x: 50
      },
      bottomAtoms: {
        atoms: model.atoms.bottom,
        x: 50,
        y: 200
      }
    };


    // add border
    this.addChild( new Rectangle( 0, 0, this.param.width, this.param.height, this.param.round, this.param.round, {stroke: 'red', lineWidth: 5} ) );

    this.topBook = new Node( {children: [
      new Rectangle( 3, 2, this.param.width - 6, this.param.height / 3, 0, this.param.round - 3, {fill: 'yellow'} ),
      new Rectangle( 3, 2 + this.param.height / 3 - this.param.round, this.param.width - 6, this.param.round, {fill: 'yellow'} )
    ]} );
    this.addChild( this.topBook );

    this.bottomBook = new Node( {children: [
      new Rectangle( 3, 2 * this.param.height / 3 - 2, this.param.width - 6, this.param.height / 3, 0, this.param.round - 3, {fill: 'rgb(187,255,187)'} ),
      new Rectangle( 3, 2 * this.param.height / 3 - 2, this.param.width - 6, this.param.round, {fill: 'rgb(187,255,187)'} )
    ]} );
    this.addChild( this.bottomBook );

    // add magnifier's target
    this.target = new MagnifierTarget( model,
      {
        x: 0,
        y: 0,
        width: this.param.width * this.param.scale,
        height: this.param.height * this.param.scale,
        round: this.param.round * this.param.scale,
        leftAnchor: {x: this.param.round, y: this.param.height},
        rightAnchor: {x: this.param.width - this.param.round, y: this.param.height}
      } );
    this.target.set( options.targetX, options.targetY );
    this.addChild( this.target );

    // add atoms
    this.addAtoms( model );

    // header text
    var text = new Text( rubAtomsString, { font: FONT, fill: 'red', pickable: false, y: this.param.height / 7} );
    text.x = (this.param.width - text.getWidth()) / 2;
    this.addChild( text );
  }

  inherit( Node, Magnifier );

  Magnifier.prototype.addAtoms = function( model ) {
    var self = this,
      radius = this.param.radius,
      topAtoms = this.param.topAtoms,
      bottomAtoms = this.param.bottomAtoms,
      dx = this.param.dx,
      dy = this.param.dy,
      color, y0, x0;

    // add one layer of atoms
    var addLayer = function( layer, y, x, color, radius ) {
      var i, n, offset;
      for ( i = 0; i < layer.length; i++ ) {
        offset = layer[i].offset || 0;
        for ( n = 0; n < layer[i].num; n++ ) {
          self.addChild( new Atom( model, {y: y, x: x + (offset + n) * dx, radius: radius, color: color} ) );
        }
      }
    };

    // add top atoms
    color = topAtoms.atoms.color;
    y0 = topAtoms.y;
    x0 = topAtoms.x;
    topAtoms.atoms.layers.forEach( function( layer, i ) {
      addLayer( layer, y0 + dy * i, x0, color, radius );
    } );

    // add bottom atoms
    color = bottomAtoms.atoms.color;
    y0 = self.param.bottomAtoms.y;
    x0 = self.param.bottomAtoms.x;
    bottomAtoms.atoms.layers.forEach( function( layer, i ) {
      addLayer( layer, y0 + dy * i, x0, color, radius );
    } );
  };

  return Magnifier;
} );