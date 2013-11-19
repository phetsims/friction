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

  var CONSTANTS = {
    ATOM_RADIUS: 7, // radius of single atom
    DISTANCE_X: 20, // x-distance between neighbors (atoms)
    DISTANCE_Y: 20, // y-distance between neighbors (atoms)
    DISTANCE_INITIAL: 25, // initial distance between top and bottom atoms
    AMPLITUDE_MIN: 1, // atom's min amplitude
    AMPLITUDE_EVAPORATE: 6, // atom's evaporation amplitude
    AMPLITUDE_MAX: 10, // atom's max amplitude
    BOOK_TOP_COLOR: 'rgb(255,255,0)', // color of top book and atoms
    BOOK_BOTTOM_COLOR: 'rgb(0,251,50)' // color of bottom book and atoms
  };

  // atoms of top book (contains 5 rows: 4 of them can evaporate, 1 - can not)
  var topAtomsStructure = [
  /**
   * First row:
   * contains 30 atoms that can not evaporate.
   *
   * */
    [
      {num: 30}
    ],
  /**
   * Second row:
   * contains 29 atoms that can evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   *
   * */
    [
      {offset: 0.5, num: 29, evaporate: true}
    ],
  /**
   * Third row:
   * contains 29 atoms that can evaporate.
   *
   * */
    [
      {num: 29, evaporate: true}
    ],
  /**
   * Fourth row:
   * contains 24 atoms, separated into 5 groups that can evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   *
   * */
    [
      {offset: 0.5, num: 5, evaporate: true},
      {offset: 6.5, num: 8, evaporate: true},
      {offset: 15.5, num: 5, evaporate: true},
      {offset: 21.5, num: 5, evaporate: true},
      {offset: 27.5, num: 1, evaporate: true}
    ],
  /**
   * Fifth row:
   * contains 9 atoms, separated into 5 groups that can evaporate.
   *
   * */
    [
      {offset: 3, num: 2, evaporate: true},
      {offset: 8, num: 1, evaporate: true},
      {offset: 12, num: 2, evaporate: true},
      {offset: 17, num: 2, evaporate: true},
      {offset: 24, num: 2, evaporate: true}
    ]
  ];

  // atoms of bottom book (contains 3 rows that can not evaporate)
  var bottomAtomsStructure = [
  /**
   * First row:
   * contains 29 atoms that can not evaporate.
   *
   * */
    [
      {num: 29}
    ],
  /**
   * Second row:
   * contains 28 atoms that can not evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   *
   * */
    [
      {offset: 0.5, num: 28}
    ],
  /**
   * Third row:
   * contains 29 atoms that can not evaporate.
   *
   * */
    [
      {num: 29}
    ]
  ];

  function FrictionModel( width, height ) {
    var model = this;

    // dimensions of the model's space
    this.width = width;
    this.height = height;

    // create a suitable structure from the initial data for further work
    this.atoms = {
      radius: CONSTANTS.ATOM_RADIUS,
      dx: CONSTANTS.DISTANCE_X,
      dy: CONSTANTS.DISTANCE_Y,
      distance: CONSTANTS.DISTANCE_INITIAL,
      amplitude: {
        min: CONSTANTS.AMPLITUDE_MIN,
        max: CONSTANTS.AMPLITUDE_MAX
      },
      evaporationLimit: CONSTANTS.AMPLITUDE_EVAPORATE,
      top: {
        color: CONSTANTS.BOOK_TOP_COLOR,
        layers: topAtomsStructure
      },
      bottom: {
        color: CONSTANTS.BOOK_BOTTOM_COLOR,
        layers: bottomAtomsStructure
      }
    };

    //REVIEW: Please add some documentation about what these two are for.
    this.toEvaporateSample = []; // array of all atoms which able to evaporate, need for resetting game
    this.toEvaporate = []; // current set of atoms, which may evaporate, but not yet evaporated

    PropertySet.call( this, {
      amplitude: this.atoms.amplitude.min, // atoms amplitude
      position: new Vector2( 0, 0 ), // position of top book, changes when dragging  //REVIEW - What is this the position of? Suggest clearer name.
      distance: model.atoms.distance, // distance between books
      bottomOffset: 0, // additional offset, results from drag
      atomRowsToEvaporate: 0, // top atoms number of rows to evaporate
      time: 0, // passed time (relative value), need for decreasing the temperature of atoms
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

    model.timeProperty.link( function( time ) {
      if ( time >= 0.033 ) {
        model.amplitude = Math.max( model.atoms.amplitude.min, model.amplitude * 0.995 );
        model.time -= 0.033;
      }
    } );
  }

  //REVIEW: Can just return this, don't need separate return statement at end, i.e. return inherit...
  return inherit( PropertySet, FrictionModel, {
    step: function( dt ) {
      this.newStep = !this.newStep;
      //REVIEW: The amplitude reduction should be a function of time rather than
      //only the number of steps.  As it is now, it will cool at different rates
      //on systems where the frame rate doesn't keep up (which currently happens
      //on iPad.
      this.time += dt;
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
} );