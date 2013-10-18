// Copyright 2002-2013, University of Colorado Boulder

/**
 * main Model container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  var PropertySet = require( 'AXON/PropertySet' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  var atoms = {
    radius: 7,
    dx: 20,
    dy: 20,
    distance: 25,
    top: {
      color: 'yellow',
      layers: [
        [
          {num: 30}
        ],
        [
          {offset: 0.5, num: 29}
        ],
        [
          {num: 29}
        ],
        [
          {offset: 0.5, num: 5},
          {offset: 6.5, num: 8},
          {offset: 15.5, num: 5},
          {offset: 21.5, num: 5},
          {offset: 27.5, num: 1}
        ],
        [
          {offset: 3, num: 2},
          {offset: 8, num: 1},
          {offset: 12, num: 2},
          {offset: 17, num: 2},
          {offset: 24, num: 2}
        ]
      ]
    },
    bottom: {
      color: 'rgb(0,251,50)',
      layers: [
        [
          {num: 29}
        ],
        [
          {offset: 0.5, num: 28}
        ],
        [
          {num: 29}
        ]
      ]
    }
  };

  function GravityAndOrbitsModel( width, height ) {
    var self = this;

    // dimensions of the model's space
    this.width = width;
    this.height = height;

    this.atoms = atoms;

    PropertySet.call( this, {
      temperature: 300, // kelvin
      position: new Vector2( 0, 0 ), // position
      distance: self.atoms.distance, // distance between books
      contact: false, // are books in contact
      hint: true // show hint text
    } );

    this.dndScale = 0.1; // drag and drop coordinate conversion factor

    self.distanceProperty.link( function( distance ) {
      self.contact = !distance;
    } );
  }

  inherit( PropertySet, GravityAndOrbitsModel, {
    step: function() {},
    reset: function() {
      this.temperatureProperty.reset();
      this.positionProperty.reset();
      this.distanceProperty.reset();
      this.contactProperty.reset();
      this.hintProperty.reset();
    },
    clear: function() {},
    move: function( v ) {
      this.hint = false;
      v.y = (v.y > this.distance ? this.distance : v.y );
      this.position = this.position.plus( v );
      this.distance = this.atoms.distance - this.position.y;
    }
  } );

  GravityAndOrbitsModel.prototype.initDrag = function( view ) {
    var self = this;
    view.cursor = 'pointer';
    view.addInputListener( new SimpleDragHandler( {
      translate: function( e ) {
        self.move( {x: e.delta.x, y: e.delta.y} );
      }
    } ) );
  };

  return GravityAndOrbitsModel;
} );