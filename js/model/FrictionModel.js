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
    radius: 7, // radius of single atom
    dx: 20, // distance-x between neighbors
    dy: 20, // distance-y between neighbors
    distance: 25, // distance between top and bottom atoms
    amplitude: { // atom's min/max amplitude
      min: 1,
      max: 10
    },
    evaporationLimit: 6, // atom's evaporation amplitude
    top: {
      color: 'yellow',
      layers: [
        [
          {num: 30}
        ],
        [
          {offset: 0.5, num: 29, evaporate: true}
        ],
        [
          {num: 29, evaporate: true}
        ],
        [
          {offset: 0.5, num: 5, evaporate: true},
          {offset: 6.5, num: 8, evaporate: true},
          {offset: 15.5, num: 5, evaporate: true},
          {offset: 21.5, num: 5, evaporate: true},
          {offset: 27.5, num: 1, evaporate: true}
        ],
        [
          {offset: 3, num: 2, evaporate: true},
          {offset: 8, num: 1, evaporate: true},
          {offset: 12, num: 2, evaporate: true},
          {offset: 17, num: 2, evaporate: true},
          {offset: 24, num: 2, evaporate: true}
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

  function FrictionModel( width, height ) {
    var model = this;

    // dimensions of the model's space
    this.width = width;
    this.height = height;

    this.atoms = atoms;
    this.toEvaporate = [];

    PropertySet.call( this, {
      amplitude: this.atoms.amplitude.min, // atoms amplitude
      position: new Vector2( 0, 0 ), // position
      distance: model.atoms.distance, // distance between books
      contact: false, // are books in contact
      hint: true, // show hint text
      newStep: false
    } );

    this.dndScale = 0.1; // drag and drop coordinate conversion factor

    // check atom's contact
    model.distanceProperty.link( function( distance ) {
      model.contact = !distance;
    } );

    // add amplitude in contact
    model.positionProperty.link( function( newPosition, oldPosition ) {
      if ( model.contact ) {
        var dx = Math.abs( newPosition.x - oldPosition.x );
        model.amplitude = Math.min( model.amplitude + dx * 0.01, model.atoms.amplitude.max );
      }
    } );

    // evaporation check
    model.amplitudeProperty.link( function( amplitude ) {
      if ( amplitude > model.atoms.evaporationLimit ) {
        model.evaporate();
      }
    } );
  }

  inherit( PropertySet, FrictionModel, {
    step: function() {
      this.newStep = !this.newStep;
      this.amplitude = Math.max( this.atoms.amplitude.min, this.amplitude * 0.995 );
    },
    reset: function() {
      this.amplitudeProperty.reset();
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

  FrictionModel.prototype.initDrag = function( view ) {
    var self = this;
    view.cursor = 'pointer';
    view.addInputListener( new SimpleDragHandler( {
      translate: function( e ) {
        self.move( {x: e.delta.x, y: e.delta.y} );
      }
    } ) );
  };

  FrictionModel.prototype.evaporate = function() {
    var atom = this.toEvaporate.shift();
    if ( atom ) {
      atom.evaporate();
    }
  };

  return FrictionModel;
} );