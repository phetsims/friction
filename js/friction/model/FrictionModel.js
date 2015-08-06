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
  var Vector2 = require( 'DOT/Vector2' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  var CONSTANTS = {
    ATOM_RADIUS: 7, // radius of single atom
    DISTANCE_X: 20, // x-distance between neighbors (atoms)
    DISTANCE_Y: 20, // y-distance between neighbors (atoms)
    DISTANCE_INITIAL: 25, // initial distance between top and bottom atoms
    AMPLITUDE_MIN: 1, // min amplitude for an atom
    AMPLITUDE_EVAPORATE: 7, // evaporation amplitude for an atom
    AMPLITUDE_MAX: 12, // atom's max amplitude
    BOOK_TOP_COLOR: 'rgb( 255, 255, 0 )', // color of top book and atoms
    BOOK_BOTTOM_COLOR: 'rgb( 0, 251, 50 )', // color of bottom book and atoms
    COOLING_RATE: 0.2, // proportion per second, adjust in order to change the cooling rate
    HEATING_MULTIPLIER: 0.0075, // multiplied by distance moved while in contact to control heating rate
    EVAPORATION_AMPLITUDE_REDUCTION: 0.01, // decrease in amplitude (a.k.a. temperature) when an atom evaporates
    MAX_X_DISPLACEMENT: 600 // max allowed distance from center x
  };

  // atoms of top book (contains 5 rows: 4 of them can evaporate, 1 - can not)
  var topAtomsStructure = [
  /**
   * First row:
   * contains 30 atoms that can not evaporate.
   *
   * */
    [
      { num: 30 }
    ],
  /**
   * Second row:
   * contains 29 atoms that can evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   *
   * */
    [
      { offset: 0.5, num: 29, evaporate: true }
    ],
  /**
   * Third row:
   * contains 29 atoms that can evaporate.
   *
   * */
    [
      { num: 29, evaporate: true }
    ],
  /**
   * Fourth row:
   * contains 24 atoms, separated into 5 groups that can evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   *
   * */
    [
      { offset: 0.5, num: 5, evaporate: true },
      { offset: 6.5, num: 8, evaporate: true },
      { offset: 15.5, num: 5, evaporate: true },
      { offset: 21.5, num: 5, evaporate: true },
      { offset: 27.5, num: 1, evaporate: true }
    ],
  /**
   * Fifth row:
   * contains 9 atoms, separated into 5 groups that can evaporate.
   *
   * */
    [
      { offset: 3, num: 2, evaporate: true },
      { offset: 8, num: 1, evaporate: true },
      { offset: 12, num: 2, evaporate: true },
      { offset: 17, num: 2, evaporate: true },
      { offset: 24, num: 2, evaporate: true }
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
      { num: 29 }
    ],
  /**
   * Second row:
   * contains 28 atoms that can not evaporate.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   *
   * */
    [
      { offset: 0.5, num: 28 }
    ],
  /**
   * Third row:
   * contains 29 atoms that can not evaporate.
   *
   * */
    [
      { num: 29 }
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

    this.toEvaporateSample = []; // array of all atoms which able to evaporate, need for resetting game
    this.toEvaporate = []; // current set of atoms which may evaporate, but not yet evaporated (generally the lowest row in the top book)

    PropertySet.call( this, {
      amplitude: this.atoms.amplitude.min, // atoms amplitude
      position: new Vector2( 0, 0 ), // position of top book, changes when dragging
      distance: model.atoms.distance, // distance between books
      bottomOffset: 0, // additional offset, results from drag
      atomRowsToEvaporate: 0, // top atoms number of rows to evaporate
      contact: false, // are books in contact
      hint: true, // show hint icon
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
        model.amplitude = Math.min( model.amplitude + dx * CONSTANTS.HEATING_MULTIPLIER, model.atoms.amplitude.max );
      }
    } );

    model.amplitudeProperty.link( function( amplitude ) {
      // evaporation check
      if ( amplitude > model.atoms.evaporationLimit ) {
        model.evaporate();
      }
    } );
  }

  return inherit( PropertySet, FrictionModel, {
    step: function( dt ) {
      if ( dt > 0.5 ) {
        // Workaround for the case when user minimize window or switches to
        // another tab and then back, where big dt values can result.
        return;
      }
      this.newStep = !this.newStep;

      // Cool the atoms.
      this.amplitude = Math.max( this.atoms.amplitude.min, this.amplitude * ( 1 - dt * CONSTANTS.COOLING_RATE ) );
    },
    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.init();
    },
    init: function() {
      var i, j;
      for ( i = 0; i < this.toEvaporateSample.length; i++ ) {
        this.toEvaporate[ i ] = this.toEvaporateSample[ i ].slice( 0 );
      }

      for ( i = 0; i < this.toEvaporate.length; i++ ) {
        for ( j = 0; j < this.toEvaporate[ i ].length; j++ ) {
          this.toEvaporate[ i ][ j ].reset();
        }
      }

      this.atomRowsToEvaporate = this.toEvaporate.length;

      // set min vertical position (initial distance + yellow atoms height + top yellow empty space, y values decrease in up direction)
      this.minYPos = this.position.y - ( this.toEvaporate.length * this.atoms.dy + 65 );
    },
    move: function( v ) {
      this.hint = false;

      // check bottom offset
      if ( this.bottomOffset > 0 && v.y < 0 ) {
        this.bottomOffset += v.y;
        v.y = 0;
      }

      // Check if the motion vector would put the book in an invalid location and limit it if so.
      if ( v.y > this.distance ) {
        this.bottomOffset += (v.y - this.distance);
        v.y = this.distance;
      }
      else if ( this.position.y + v.y < this.minYPos ) {
        v.y = this.minYPos - this.position.y; // Limit book from going out of magnifier window.
      }
      if ( this.position.x + v.x > CONSTANTS.MAX_X_DISPLACEMENT ) {
        v.x = CONSTANTS.MAX_X_DISPLACEMENT - this.position.x;
      }
      else if ( this.position.x + v.x < -CONSTANTS.MAX_X_DISPLACEMENT ) {
        v.x = -CONSTANTS.MAX_X_DISPLACEMENT - this.position.x;
      }

      // set the new position
      this.position = this.position.plus( v );
    },
    initDrag: function( view ) {
      var self = this;
      view.cursor = 'pointer';
      view.addInputListener( new SimpleDragHandler( {
        translate: function( e ) {
          self.move( { x: e.delta.x, y: e.delta.y } );
        },
        end: function() {
          self.bottomOffset = 0;
        }
      } ) );
    },
    evaporate: function() {
      if ( this.toEvaporate[ this.toEvaporate.length - 1 ] && !this.toEvaporate[ this.toEvaporate.length - 1 ].length ) {
        // move to the next row of atoms to evaporate
        this.toEvaporate.pop();
        this.distance += this.atoms.dy;
        this.atomRowsToEvaporate = this.toEvaporate.length;
      }

      if ( this.toEvaporate[ this.toEvaporate.length - 1 ] ) {
        // choose a random atom from the current row and evaporate it
        var currentEvaporationRow = this.toEvaporate[ this.toEvaporate.length - 1 ];
        var atom = currentEvaporationRow.splice( Math.floor( Math.random() * currentEvaporationRow.length ), 1 )[ 0 ];
        if ( atom ) {
          atom.evaporate();
          this.amplitude -= CONSTANTS.EVAPORATION_AMPLITUDE_REDUCTION; // cooling due to evaporation
        }
      }
    }
  } );
} );
