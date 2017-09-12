// Copyright 2013-2015, University of Colorado Boulder

/**
 * main Model container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );
  var FrictionSharedConstants = require( 'FRICTION/friction/FrictionSharedConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  var CONSTANTS = {
    ATOM_RADIUS: FrictionSharedConstants.ATOM_RADIUS, // radius of single atom
    DISTANCE_X: 20, // x-distance between neighbors (atoms)
    DISTANCE_Y: 20, // y-distance between neighbors (atoms)
    DISTANCE_INITIAL: 25, // initial distance between top and bottom atoms
    AMPLITUDE_MIN: 1, // min amplitude for an atom
    AMPLITUDE_EVAPORATE: 7, // evaporation amplitude for an atom
    AMPLITUDE_MAX: 12, // atom's max amplitude
    BOOK_TOP_ATOMS_COLOR: FrictionSharedConstants.TOP_BOOK_ATOMS_COLOR, // color of top book
    BOOK_BOTTOM_ATOMS_COLOR: FrictionSharedConstants.BOTTOM_BOOK_ATOMS_COLOR, // color of bottom
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
    var self = this;

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
        color: CONSTANTS.BOOK_TOP_ATOMS_COLOR,
        layers: topAtomsStructure
      },
      bottom: {
        color: CONSTANTS.BOOK_BOTTOM_ATOMS_COLOR,
        layers: bottomAtomsStructure
      }
    };

    this.toEvaporateSample = []; // array of all atoms which able to evaporate, need for resetting game
    this.toEvaporate = []; // current set of atoms which may evaporate, but not yet evaporated (generally the lowest row in the top book)

    this.amplitudeProperty = new Property( this.atoms.amplitude.min ); // atoms amplitude
    this.positionProperty = new Property( new Vector2( 0, 0 ) ); // position of top book, changes when dragging
    this.distanceProperty = new Property( self.atoms.distance ); // distance between books
    this.bottomOffsetProperty = new Property( 0 ); // additional offset, results from drag
    this.atomRowsToEvaporateProperty = new Property( 0 ); // top atoms number of rows to evaporate
    this.contactProperty = new Property( false ); // are books in contact
    this.hintProperty = new Property( true ); // show hint icon
    this.newStepProperty = new Property( false ); // update every step

    this.dndScale = 0.025; // drag and drop book coordinates conversion coefficient

    // check atom's contact
    self.distanceProperty.link( function( distance ) {
      self.contactProperty.set( Math.floor( distance ) <= 0 );
    } );

    self.positionProperty.link( function( newPosition, oldPosition ) {
      // set distance between atoms
      self.distanceProperty.set( self.distanceProperty.get() - (newPosition.minus( oldPosition || new Vector2( 0, 0 ) )).y );

      // add amplitude in contact
      if ( self.contactProperty.get() ) {
        var dx = Math.abs( newPosition.x - oldPosition.x );
        self.amplitudeProperty.set( Math.min( self.amplitudeProperty.get() + dx * CONSTANTS.HEATING_MULTIPLIER, self.atoms.amplitude.max ) );
      }
    } );

    self.amplitudeProperty.link( function( amplitude ) {
      // evaporation check
      if ( amplitude > self.atoms.evaporationLimit ) {
        self.evaporate();
      }
    } );
  }

  friction.register( 'FrictionModel', FrictionModel );

  return inherit( Object, FrictionModel, {
    step: function( dt ) {
      if ( dt > 0.5 ) {
        // Workaround for the case when user minimize window or switches to
        // another tab and then back, where big dt values can result.
        return;
      }
      this.newStepProperty.set( !this.newStepProperty.get() );

      // Cool the atoms.
      this.amplitudeProperty.set( Math.max( this.atoms.amplitude.min, this.amplitudeProperty.get() * ( 1 - dt * CONSTANTS.COOLING_RATE ) ) );
    },
    reset: function() {
      this.amplitudeProperty.reset();
      this.positionProperty.reset();
      this.distanceProperty.reset();
      this.bottomOffsetProperty.reset();
      this.atomRowsToEvaporateProperty.reset();
      this.contactProperty.reset();
      this.hintProperty.reset();
      this.newStepProperty.reset();
      this.init();
    },
    init: function() {
      var i;
      var j;
      for ( i = 0; i < this.toEvaporateSample.length; i++ ) {
        this.toEvaporate[ i ] = this.toEvaporateSample[ i ].slice( 0 );
      }

      for ( i = 0; i < this.toEvaporate.length; i++ ) {
        for ( j = 0; j < this.toEvaporate[ i ].length; j++ ) {
          this.toEvaporate[ i ][ j ].reset();
        }
      }

      this.atomRowsToEvaporateProperty.set( this.toEvaporate.length );

      // set min vertical position
      this.minYPos = -70; // empirically determined such that top book can't be completely dragged out of frame
    },

    /**
     * Move the book, checking to make sure the new location is valid. If the book is going to move out of bounds,
     * prevent movement.
     * 
     * @public
     * @param {Object} v {x:{number}, y:{number}} - NOT a Vector2 (presumably to reduce memory footprint)
     * @param {number} v.x
     * @param {number} v.y
     */
    move: function( v ) {
      this.hintProperty.set( false );

      // check bottom offset
      if ( this.bottomOffsetProperty.get() > 0 && v.y < 0 ) {
        this.bottomOffsetProperty.set( this.bottomOffsetProperty.get() + v.y );
        v.y = 0;
      }

      // Check if the motion vector would put the book in an invalid location and limit it if so.
      if ( v.y > this.distanceProperty.get() ) {
        this.bottomOffsetProperty.set( this.bottomOffsetProperty.get() + v.y - this.distanceProperty.get() );
        v.y = this.distanceProperty.get();
      }
      else if ( this.positionProperty.get().y + v.y < this.minYPos ) {
        v.y = this.minYPos - this.positionProperty.get().y; // Limit book from going out of magnifier window.
      }
      if ( this.positionProperty.get().x + v.x > CONSTANTS.MAX_X_DISPLACEMENT ) {
        v.x = CONSTANTS.MAX_X_DISPLACEMENT - this.positionProperty.get().x;
      }
      else if ( this.positionProperty.get().x + v.x < -CONSTANTS.MAX_X_DISPLACEMENT ) {
        v.x = -CONSTANTS.MAX_X_DISPLACEMENT - this.positionProperty.get().x;
      }

      // set the new position
      this.positionProperty.set( this.positionProperty.get().plus( v ) );
    },
    initDrag: function( view ) {
      var self = this;
      view.cursor = 'pointer';
      view.addInputListener( new SimpleDragHandler( {
        translate: function( e ) {
          self.move( { x: e.delta.x, y: e.delta.y } );
        },
        end: function() {
          self.bottomOffsetProperty.set( 0 );
        }
      } ) );
    },
    evaporate: function() {
      if ( this.toEvaporate[ this.toEvaporate.length - 1 ] && !this.toEvaporate[ this.toEvaporate.length - 1 ].length ) {
        // move to the next row of atoms to evaporate
        this.toEvaporate.pop();
        this.distanceProperty.set( this.distanceProperty.get() + this.atoms.dy );
        this.atomRowsToEvaporateProperty.set( this.toEvaporate.length );
      }

      if ( this.toEvaporate[ this.toEvaporate.length - 1 ] ) {
        // choose a random atom from the current row and evaporate it
        var currentEvaporationRow = this.toEvaporate[ this.toEvaporate.length - 1 ];
        var atom = currentEvaporationRow.splice( Math.floor( Math.random() * currentEvaporationRow.length ), 1 )[ 0 ];
        if ( atom ) {
          atom.evaporate();
          this.amplitudeProperty.set( this.amplitudeProperty.get() - CONSTANTS.EVAPORATION_AMPLITUDE_REDUCTION ); // cooling due to evaporation
        }
      }
    }
  } );
} );
