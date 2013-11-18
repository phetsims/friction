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

  //REVIEW: This is quite a complex data structure with nested objects and
  // arrays.  It is harder to decipher this than, say, breaking out the
  // constants (like radius and neighbor distances and amplitude range),
  // having a class for 'AtomsLayer' and having an array for just the upper
  // and lower layers.  Why was it done this way?  Was it like this in the
  // original code (the original developer of this sim was a Physics professor
  // who was inexperienced at software development)?  If not, this should be
  // modularized.
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

    //REVIEW: Please add some documentation about what these two are for.
    this.toEvaporateSample = [];
    this.toEvaporate = [];

    PropertySet.call( this, {
      amplitude: this.atoms.amplitude.min, // atoms amplitude
      position: new Vector2( 0, 0 ), // position //REVIEW - What is this the position of? Suggest clearer name.
      distance: model.atoms.distance, // distance between books
      bottomOffset: 0, // additional offset, results from drag
      atomRowsToEvaporate: 0, // top atoms number of rows to evaporate
      contact: false, // are books in contact
      hint: true, // show hint text
      newStep: false // update every step
    } );

    this.dndScale = 0.025; // drag and drop book coordinates conversion coefficient

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

  //REVIEW: Can just return this, don't need separate return statement at end, i.e. return inherit...
  inherit( PropertySet, FrictionModel, {
    step: function() {
      this.newStep = !this.newStep;
      //REVIEW: The amplitude reduction should be a function of time rather than
      //only the number of steps.  As it is now, it will cool at different rates
      //on systems where the frame rate doesn't keep up (which currently happens
      //on iPad.
      this.amplitude = Math.max( this.atoms.amplitude.min, this.amplitude * 0.995 );
    },
    reset: function() {
      this.amplitudeProperty.reset();
      this.positionProperty.reset();
      this.distanceProperty.reset();
      this.contactProperty.reset();
      this.hintProperty.reset();
      this.bottomOffsetProperty.reset();
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

      this.atomRowsToEvaporate = this.toEvaporate.length;

      // set max distance (initial distance + yellow atoms height + top yellow empty space)
      this.distanceMax = this.atoms.distance + this.toEvaporate.length * this.atoms.dy + 65;
    },
    move: function( v ) {
      this.hint = false;

      // check bottom offset
      if ( this.bottomOffset > 0 && v.y < 0 ) {
        this.bottomOffset += v.y;
        v.y = 0;
      }

      // set position
      if ( v.y > this.distance ) {
        this.bottomOffset += (v.y - this.distance);
        v.y = this.distance;
      }
      this.position = this.position.plus( v );

      // check max distance
      var dy = this.distanceMax - this.distance;
      if ( dy < 0 ) {
        this.position = this.position.minus( new Vector2( 0, dy ) );
      }
    },
    initDrag: function( view ) {
      var self = this;
      view.cursor = 'pointer';
      view.addInputListener( new SimpleDragHandler( {
        translate: function( e ) {
          self.move( {x: e.delta.x, y: e.delta.y} );
        },
        end: function() {
          self.bottomOffset = 0;
        }
      } ) );
    },
    evaporate: function() {
      if ( this.toEvaporate[this.toEvaporate.length - 1] && !this.toEvaporate[this.toEvaporate.length - 1].length ) {
        this.toEvaporate.pop();
        this.distance += this.atoms.dy;
        this.atomRowsToEvaporate = this.toEvaporate.length;
      }

      if ( this.toEvaporate[this.toEvaporate.length - 1] ) {
        var atom = this.toEvaporate[this.toEvaporate.length - 1].pop();
        if ( atom ) {
          atom.evaporate();
          this.amplitude -= 0.125;
        }
      }
    }
  } );

  return FrictionModel;
} );