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
    this.toEvaporateSample = [];
    this.toEvaporate = [];

    PropertySet.call( this, {
      amplitude: this.atoms.amplitude.min, // atoms amplitude
      position: new Vector2( 0, 0 ), // position
      distance: model.atoms.distance, // distance between books
      contact: false, // are books in contact
      hint: true, // show hint text
      newStep: false // update every step
    } );

    this.dndScale = 0.1; // drag and drop coordinate conversion factor

    // check atom's contact
    model.distanceProperty.link( function( distance ) {
      model.contact = (Math.floor( distance ) <= 0);
    } );

    model.positionProperty.link( function( newPosition, oldPosition ) {
      // set distance between atoms
      model.distance -= (newPosition.minus( oldPosition || new Vector2( 0, 0 ) )).y;

      // add amplitude in contact
      if ( model.contact ) {
        var dx = Math.abs( newPosition.x - oldPosition.x );
        model.amplitude = Math.min( model.amplitude + dx * 0.01, model.atoms.amplitude.max );
      }
    } );

    model.amplitudeProperty.link( function( amplitude ) {
      // evaporation check
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
      this.init();
    },
    init: function() {
      var i, j;
      for ( i = 0; i < this.toEvaporateSample.length; i++ ) {
        this.toEvaporate[i] = this.toEvaporateSample[i].slice( 0 );
      }

      for ( i = 0; i < this.toEvaporate.length; i++ ) {
        for ( j = 0; j < this.toEvaporate[i].length; j++ ) {
          this.toEvaporate[i][j].reset();
        }
      }

      // set max distance (initial distance + yellow atoms height + top yellow empty space)
      this.distanceMax = this.atoms.distance + this.toEvaporate.length * this.atoms.dy + 65;
    },
    move: function( v ) {
      this.hint = false;
      v.y = (v.y > this.distance ? this.distance : v.y );
      this.position = this.position.plus( v );

      // check max distance
      var dy = this.distanceMax - this.distance;
      if ( dy < 0 ) {
        this.position = this.position.minus( new Vector2( 0, dy ) );
      }
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
    if ( this.toEvaporate[this.toEvaporate.length - 1] && !this.toEvaporate[this.toEvaporate.length - 1].length ) {
      this.toEvaporate.pop();
      this.distance += this.atoms.dy;
      this.amplitude -= 0.25;
    }

    if ( this.toEvaporate[this.toEvaporate.length - 1] ) {
      var atom = this.toEvaporate[this.toEvaporate.length - 1].pop();
      if ( atom ) {
        atom.evaporate();
      }
    }
  };

  return FrictionModel;
} );