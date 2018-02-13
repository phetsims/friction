// Copyright 2013-2018, University of Colorado Boulder

/**
 * The model for the Friction sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Emitter = require( 'AXON/Emitter' );
  var friction = require( 'FRICTION/friction' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var PropertyIO = require( 'AXON/PropertyIO' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vector2IO = require( 'DOT/Vector2IO' );

  // phet-io modules
  var BooleanIO = require( 'ifphetio!PHET_IO/types/BooleanIO' );

  // constants
  var ATOM_RADIUS = FrictionConstants.ATOM_RADIUS; // radius of single atom
  var ATOM_SPACING_X = 20; // x-distance between neighbors (atoms)
  var ATOM_SPACING_Y = 20; // y-distance between neighbors (atoms)
  var INITIAL_ATOM_SPACING_Y = 25; // initial distance between top and bottom atoms
  var AMPLITUDE_MIN = 1; // min amplitude for an atom
  var AMPLITUDE_EVAPORATE = 7; // evaporation amplitude for an atom
  var AMPLITUDE_MAX = 12; // atom's max amplitude
  var BOOK_TOP_ATOMS_COLOR = FrictionConstants.TOP_BOOK_ATOMS_COLOR; // color of top book
  var BOOK_BOTTOM_ATOMS_COLOR = FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR; // color of bottom
  var COOLING_RATE = 0.2; // proportion per second; adjust in order to change the cooling rate
  var HEATING_MULTIPLIER = 0.0075; // multiplied by distance moved while in contact to control heating rate
  var EVAPORATION_AMPLITUDE_REDUCTION = 0.01; // decrease in amplitude (a.k.a. temperature) when an atom evaporates
  var MAX_X_DISPLACEMENT = 600; // max allowed distance from center x
  var MIN_Y_POSITION = -70; // empirically determined such that top book can't be completely dragged out of frame

  // TODO: rename amplitude => temperature throughout the project?  Or maybe not?

  // atoms of top book (contains 5 rows: 4 of them can evaporate, 1 - can not)
  var topAtomsStructure = [
    /**
     * First row:
     * contains 30 atoms that can not evaporate.
     */
    [
      { num: 30 }
    ],
    /**
     * Second row:
     * contains 29 atoms that can evaporate.
     * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
     */
    [
      { offset: 0.5, num: 29, evaporate: true }
    ],
    /**
     * Third row:
     * contains 29 atoms that can evaporate.
     */
    [
      { num: 29, evaporate: true }
    ],
    /**
     * Fourth row:
     * contains 24 atoms, separated into 5 groups that can evaporate.
     * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
     */
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
     */
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
     */
    [
      { num: 29 }
    ],
    /**
     * Second row:
     * contains 28 atoms that can not evaporate.
     * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
     */
    [
      { offset: 0.5, num: 28 }
    ],
    /**
     * Third row:
     * contains 29 atoms that can not evaporate.
     */
    [
      { num: 29 }
    ]
  ];

  /**
   * @param {number} width - width in view=model coordinates
   * @param {number} height - height in view=model coordinates
   * @param {Tandem} tandem
   * @constructor
   */
  function FrictionModel( width, height, tandem ) {
    var self = this;

    // @public (read-only) - the width for the model in model=view coordinates
    this.width = width;

    // @public (read-only) - the height for the model in model=view coordinates
    this.height = height;

    // @private - track how much to evaporate in step() to prevent a Property loop
    this.scheduledEvaporationAmount = 0;

    // @public (read-only) - create a suitable structure from the initial data for further work
    this.atoms = {
      radius: ATOM_RADIUS,
      distanceX: ATOM_SPACING_X,
      distanceY: ATOM_SPACING_Y,
      distance: INITIAL_ATOM_SPACING_Y,
      amplitude: {
        min: AMPLITUDE_MIN,
        max: AMPLITUDE_MAX
      },
      evaporationLimit: AMPLITUDE_EVAPORATE,
      top: {
        color: BOOK_TOP_ATOMS_COLOR,
        layers: topAtomsStructure
      },
      bottom: {
        color: BOOK_BOTTOM_ATOMS_COLOR,
        layers: bottomAtomsStructure
      }
    };

    // TODO: docs
    // TODO: annotation (and readonly)
    this.evaporationEmitter = new Emitter( {
      tandem: tandem.createTandem( 'evaporationEmitter' )
    } );

    // @public - array of all AtomNodes which able to evaporate, need for resetting game
    this.toEvaporateSample = [];

    // @public - current set of AtomNodes which may evaporate, but not yet evaporated (generally the lowest row in the
    // top book)
    // TODO: it seems incorrect to have a list of Nodes in the model
    this.toEvaporate = [];

    // @public - atoms temperature = amplitude of oscillation
    this.amplitudeProperty = new NumberProperty( this.atoms.amplitude.min, {
      tandem: tandem.createTandem( 'amplitudeProperty' )
    } );

    // @public - position of top book, changes when dragging
    this.bookPositionProperty = new Property( new Vector2( 0, 0 ), {
      phetioType: PropertyIO( Vector2IO ),
      tandem: tandem.createTandem( 'bookPositionProperty' )
    } );

    // @public - distance between books
    this.distanceProperty = new Property( this.atoms.distance );

    // @private - additional offset, results from drag
    this.bottomOffsetProperty = new Property( 0 );

    // @public - top atoms number of rows to evaporate
    this.atomRowsToEvaporateProperty = new Property( 0 );

    // @private - are books in contact
    this.contactProperty = new Property( false, {
      tandem: tandem.createTandem( 'contactProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );

    // @public (read-only) - show hint icon
    this.hintProperty = new Property( true );

    // @public (read-only)- update every step
    // TODO: Use an emitter here
    this.newStepProperty = new Property( false );

    // @public (read-only) - drag and drop book coordinates conversion coefficient
    this.dndScale = 0.025; // TODO: better name

    // check atom's contact
    this.distanceProperty.link( function( distance ) {
      self.contactProperty.set( Math.floor( distance ) <= 0 );
    } );

    // set distance between atoms and set the amplitude if they are in contact
    this.bookPositionProperty.link( function( newPosition, oldPosition ) {
      oldPosition = oldPosition || Vector2.ZERO;
      self.distanceProperty.set( self.distanceProperty.get() - ( newPosition.minus( oldPosition ) ).y );
      if ( self.contactProperty.get() ) {
        var dx = Math.abs( newPosition.x - oldPosition.x );
        var newValue = self.amplitudeProperty.get() + dx * HEATING_MULTIPLIER;
        self.amplitudeProperty.set( Math.min( newValue, self.atoms.amplitude.max ) );
      }
    } );

    // evaporation check
    this.amplitudeProperty.link( function( amplitude ) {
      if ( amplitude > self.atoms.evaporationLimit ) {
        self.tryToEvaporate();
      }
    } );
  }

  friction.register( 'FrictionModel', FrictionModel );

  return inherit( Object, FrictionModel, {

    /**
     * Move forward in time
     * @param {number} dt - in seconds
     * @public
     */
    step: function( dt ) {

      // Workaround for the case when user minimize window or switches to
      // another tab and then back, where big dt values can result.
      if ( dt > 0.5 ) {
        return;
      }

      // TODO: what is happening here?
      this.newStepProperty.set( !this.newStepProperty.get() );

      // Cool the atoms.
      var amplitude = this.amplitudeProperty.get() - this.scheduledEvaporationAmount;
      amplitude = Math.max( this.atoms.amplitude.min, amplitude * ( 1 - dt * COOLING_RATE ) );
      this.amplitudeProperty.set( amplitude );

      this.scheduledEvaporationAmount = 0;
    },

    /**
     * Restores the initial conditions.
     * @public
     */
    reset: function() {
      this.amplitudeProperty.reset();
      this.bookPositionProperty.reset();
      this.distanceProperty.reset();
      this.bottomOffsetProperty.reset();
      this.atomRowsToEvaporateProperty.reset();
      this.contactProperty.reset();
      this.hintProperty.reset();
      this.newStepProperty.reset();
      this.init();
    },

    /**
     * TODO: this must be called from the end of the view construction for unknown reasonrs, or atoms don't fly off
     * @public
     */
    init: function() {
      for ( var i = 0; i < this.toEvaporateSample.length; i++ ) {
        this.toEvaporate[ i ] = this.toEvaporateSample[ i ].slice( 0 );
      }

      for ( i = 0; i < this.toEvaporate.length; i++ ) {
        for ( var j = 0; j < this.toEvaporate[ i ].length; j++ ) {
          this.toEvaporate[ i ][ j ].reset();
        }
      }

      this.atomRowsToEvaporateProperty.set( this.toEvaporate.length );

      // set min vertical position
      this.minYPos = MIN_Y_POSITION; // TODO: better name
    },

    /**
     * Move the book, checking to make sure the new location is valid. If the book is going to move out of bounds,
     * prevent movement.
     *
     * TODO: arg should be Vector2
     * @param {Object} v {x:{number}, y:{number}} - NOT a Vector2 (presumably to reduce memory footprint)
     * @public
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
      else if ( this.bookPositionProperty.get().y + v.y < this.minYPos ) {
        v.y = this.minYPos - this.bookPositionProperty.get().y; // Limit book from going out of magnifier window.
      }
      if ( this.bookPositionProperty.get().x + v.x > MAX_X_DISPLACEMENT ) {
        v.x = MAX_X_DISPLACEMENT - this.bookPositionProperty.get().x;
      }
      else if ( this.bookPositionProperty.get().x + v.x < -MAX_X_DISPLACEMENT ) {
        v.x = -MAX_X_DISPLACEMENT - this.bookPositionProperty.get().x;
      }

      // set the new position
      // TODO: Vector2.plus should take a Vector2 argument
      this.bookPositionProperty.set( this.bookPositionProperty.get().plus( v ) );
    },

    /**
     * // TODO: this seems like the wrong place for this code
     * @param {Node} node - the node which will receive the input listener
     * @param {Tandem} tandem
     * @public
     */
    addDragInputListener: function( node, tandem ) {
      var self = this;
      node.cursor = 'pointer';
      node.addInputListener( new SimpleDragHandler( {
        translate: function( e ) {
          self.move( { x: e.delta.x, y: e.delta.y } );
        },
        end: function() {
          self.bottomOffsetProperty.set( 0 );
        },
        tandem: tandem
      } ) );
    },

    /**
     * TODO: document me
     * @private
     */
    tryToEvaporate: function() {
      if ( this.toEvaporate[ this.toEvaporate.length - 1 ] && !this.toEvaporate[ this.toEvaporate.length - 1 ].length ) {

        // move to the next row of atoms to evaporate
        this.toEvaporate.pop();
        this.distanceProperty.set( this.distanceProperty.get() + this.atoms.distanceY );
        this.atomRowsToEvaporateProperty.set( this.toEvaporate.length );
      }

      if ( this.toEvaporate[ this.toEvaporate.length - 1 ] ) {

        // choose a random atom from the current row and evaporate it
        var currentEvaporationRow = this.toEvaporate[ this.toEvaporate.length - 1 ];
        var atomNode = currentEvaporationRow.splice( Math.floor( phet.joist.random.nextDouble() * currentEvaporationRow.length ), 1 )[ 0 ];
        if ( atomNode ) {
          atomNode.evaporate();
          this.evaporationEmitter.emit();

          // cooling due to evaporation
          this.scheduledEvaporationAmount = this.scheduledEvaporationAmount + EVAPORATION_AMPLITUDE_REDUCTION;
        }
      }
    }
  }, {

    // statics

    // a11y - needed to get bounds for the keyboard drag handler, see https://github.com/phetsims/friction/issues/46
    MAX_X_DISPLACEMENT: MAX_X_DISPLACEMENT,
    MIN_Y_POSITION: MIN_Y_POSITION
  } );
} );