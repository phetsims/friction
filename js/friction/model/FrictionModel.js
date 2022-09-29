// Copyright 2013-2022, University of Colorado Boulder

/**
 * The model for the Friction sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import friction from '../../friction.js';
import FrictionConstants from '../FrictionConstants.js';
import Atom from './Atom.js';

// constants
const ATOM_RADIUS = FrictionConstants.ATOM_RADIUS; // radius of single atom
const ATOM_SPACING_Y = 20; // y-distance between neighbors (atoms)
const INITIAL_ATOM_SPACING_Y = 25; // initial distance between top and bottom atoms
const VIBRATION_AMPLITUDE_MIN = 1; // min amplitude for an atom
const AMPLITUDE_SHEAR_OFF = 7; // amplitude for an atom to shear off
const VIBRATION_AMPLITUDE_MAX = 12; // atom's max amplitude
const TOP_BOOK_ATOMS_COLOR = FrictionConstants.TOP_BOOK_ATOMS_COLOR; // color of top book
const BOTTOM_BOOK_ATOMS_COLOR = FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR; // color of bottom
const COOLING_RATE = 0.2; // proportion per second; adjust in order to change the cooling rate
const HEATING_MULTIPLIER = 0.0075; // multiplied by distance moved while in contact to control heating rate
const SHEAR_OFF_AMPLITUDE_REDUCTION = 0.01; // decrease in amplitude (a.k.a. temperature) when an atom shears off
const MAX_X_DISPLACEMENT = 600; // max allowed distance from center x
const MIN_Y_POSITION = -70; // empirically determined such that top book can't be completely dragged out of frame
const DEFAULT_ROW_START_X_POSITION = 50;

// atoms of top book, contains 5 rows, 4 of which can shear off and 1 that can't
const TOP_BOOK_ATOM_STRUCTURE = [

  /*
   * First row:
   * contains 30 atoms that can not shear off.
   */
  [
    { num: 30 }
  ],

  /*
   * Second row:
   * contains 29 atoms that can shear off.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   */
  [
    { offset: 0.5, num: 29, canShearOff: true }
  ],

  /*
   * Third row:
   * contains 29 atoms that can shear off.
   */
  [
    { num: 29, canShearOff: true }
  ],

  /*
   * Fourth row:
   * contains 24 atoms, separated into 5 groups that can shear off.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   */
  [
    { offset: 0.5, num: 5, canShearOff: true },
    { offset: 6.5, num: 8, canShearOff: true },
    { offset: 15.5, num: 5, canShearOff: true },
    { offset: 21.5, num: 5, canShearOff: true },
    { offset: 27.5, num: 1, canShearOff: true }
  ],

  /*
   * Fifth row:
   * contains 9 atoms, separated into 5 groups that can shear off.
   */
  [
    { offset: 3, num: 2, canShearOff: true },
    { offset: 8, num: 1, canShearOff: true },
    { offset: 12, num: 2, canShearOff: true },
    { offset: 17, num: 2, canShearOff: true },
    { offset: 24, num: 2, canShearOff: true }
  ]
];

// atoms of bottom book (contains 3 rows that can not shear off)
const BOTTOM_BOOK_ATOM_STRUCTURE = [

  /*
   * First row:
   * contains 29 atoms that can not shear off.
   */
  [
    { num: 29 }
  ],

  /*
   * Second row:
   * contains 28 atoms that can not shear off.
   * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
   */
  [
    { offset: 0.5, num: 28 }
  ],

  /*
   * Third row:
   * contains 29 atoms that can not shear off.
   */
  [
    { num: 29 }
  ]
];


// pdom
// iterate through the constant to determine the number of atoms that can shear off from the top book structure
let atoms = 0;
TOP_BOOK_ATOM_STRUCTURE.forEach( row => {
  row.forEach( schema => {
    if ( schema.canShearOff ) {
      atoms += schema.num;
    }
  } );
} );

// the number of shearable atoms in the top book
const NUMBER_OF_SHEARABLE_ATOMS = atoms;

// information about the nature of the atoms that will be shown in the magnifier window
const MAGNIFIED_ATOMS_INFO = {
  radius: ATOM_RADIUS,
  distanceX: FrictionConstants.INITIAL_ATOM_SPACING_X,
  distanceY: FrictionConstants.INITIAL_ATOM_SPACING_Y,
  distance: INITIAL_ATOM_SPACING_Y,
  vibrationAmplitude: new Range( VIBRATION_AMPLITUDE_MIN, VIBRATION_AMPLITUDE_MAX ),
  shearingLimit: AMPLITUDE_SHEAR_OFF,
  top: {
    color: TOP_BOOK_ATOMS_COLOR,
    layerDescriptions: TOP_BOOK_ATOM_STRUCTURE
  },
  bottom: {
    color: BOTTOM_BOOK_ATOMS_COLOR,
    layerDescriptions: BOTTOM_BOOK_ATOM_STRUCTURE
  }
};

class FrictionModel extends PhetioObject {

  /**
   * @param {number} width - width in view=model coordinates
   * @param {number} height - height in view=model coordinates
   * @param {Tandem} tandem
   */
  constructor( width, height, tandem ) {

    super( {
      tandem: tandem,
      phetioType: FrictionModel.FrictionModelIO
    } );

    // @public (read-only) {Number} - the width for the model in model coordinates
    this.width = width;

    // @public (read-only) {Number} - the height for the model in model coordinates
    this.height = height;

    // @private {Number} - track how much to shear off in step() to prevent a Property loop
    this.scheduledShearingAmount = 0;

    // @public (phet-io) - Instrumented so that PhET-iO clients can get a message when an atom shears off
    this.shearedOffEmitter = new Emitter( {
      tandem: tandem.createTandem( 'shearedOffEmitter' ),
      phetioDocumentation: 'Emits when atoms shear off from the top book',
      phetioReadOnly: true
    } );

    // @public (read-only) {Atom[][]}- array of all atoms which are able to shear off organized by row such that the
    // last rows should be sheared off first
    this.shearableAtomsByRow = [];

    // @public (read-only) {NumberProperty} - atoms temperature = amplitude of oscillation
    this.vibrationAmplitudeProperty = new NumberProperty( MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min, {
      range: MAGNIFIED_ATOMS_INFO.vibrationAmplitude,

      tandem: tandem.createTandem( 'vibrationAmplitudeProperty' ),
      phetioDocumentation: 'A relative, qualitative value describing the amount of vibration of the atoms',
      phetioHighFrequency: true,
      phetioReadOnly: true
    } );

    // @public - position of top book, can by dragged the user
    this.topBookPositionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      phetioDocumentation: 'The position of the top book. In view coordinates (model and view coordinates are the same in this simulation).',
      tandem: tandem.createTandem( 'topBookPositionProperty' ),
      phetioHighFrequency: true
    } );

    // @public {NumberProperty} - distance between books
    this.distanceBetweenBooksProperty = new NumberProperty( MAGNIFIED_ATOMS_INFO.distance, {
      tandem: tandem.createTandem( 'distanceBetweenBooksProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'The distance between the edges of the two books. In view coordinates.'
    } );

    // @public (read-only) - The draggable bounds of the top book. This Bounds2 instance is never changed, but only mutated.
    // Each mutation triggers listener notification (without an "oldValue" param).
    this.topBookDragBoundsProperty = new Property( new Bounds2(
      -MAX_X_DISPLACEMENT, // left bound
      MIN_Y_POSITION, // top bound
      MAX_X_DISPLACEMENT, // right bound
      this.distanceBetweenBooksProperty.value ), {
      phetioValueType: Bounds2.Bounds2IO,
      tandem: tandem.createTandem( 'topBookDragBoundsProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The draggable bounds of the top book. This changes as rows of atoms shear off.'
    } );

    // @public (read-only) {NumberProperty} -
    this.atomRowsToShearOffProperty = new NumberProperty( TOP_BOOK_ATOM_STRUCTURE.length - 1, {
      tandem: tandem.createTandem( 'atomRowsToShearOffProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The number of rows of atoms available to shear off, goes down as atom rows shear off'
    } );

    // @private - are books in contact?
    this.contactProperty = new DerivedProperty(
      [ this.distanceBetweenBooksProperty ],
      distance => Math.floor( distance ) <= 0, {
        tandem: tandem.createTandem( 'contactProperty' ),
        phetioValueType: BooleanIO,
        phetioDocumentation: 'This Property will be true when the two books are in contact, with not space between their atoms.'
      } );

    // @public {BooleanProperty} - Show hint icon. Only set by model and on a11y grab interaction.
    this.hintProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'hintProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether or not the sim is conveying the hint arrows. This is not editable, but can be ' +
                           'overridden by toggling the "hintArrowsNode.visibleProperty" in the view.'
    } );

    // @public {Number} (read-only) - drag and drop book coordinates conversion coefficient
    this.bookDraggingScaleFactor = 0.025;

    // @public (read-only) {Atom[]} - array of atoms that are visible to the user in the magnifier window
    this.atoms = [];

    // @public (read-only)
    // {number} the count of how many atoms have been sheared off
    this.numberOfAtomsShearedOffProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'numberOfAtomsShearedOffProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'The total number of atoms that have been sheared off of the top book.'
    } );

    this.shearedOffEmitter.addListener( () => {
      this.numberOfAtomsShearedOffProperty.value += 1;
    } );

    // @public (read-only)
    // {boolean} - has the atom been "successfully" interacted with. This subjective term is defined based on the
    // pedagogical goals of the sim (to rub the other book)
    this.successfullyInteractedWithProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'successfullyInteractedWithProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'This somewhat subjective term is defined based on the pedagogical goals of the sim, which ' +
                           'is to rub the book on the other to make friction. This Property will be true when any amount ' +
                           'of friction is created.'
    } );

    this.vibrationAmplitudeProperty.link( amplitude => {
      if ( !this.successfullyInteractedWithProperty.value && amplitude > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD ) {
        this.successfullyInteractedWithProperty.value = true;
      }
    } );

    const atomsTandem = tandem.createTandem( 'atoms' );

    // add the atoms that are visible in the top book
    MAGNIFIED_ATOMS_INFO.top.layerDescriptions.forEach( ( layerDescription, i ) => {
      addAtomRow(
        this,
        layerDescription,
        DEFAULT_ROW_START_X_POSITION,
        FrictionConstants.MAGNIFIER_WINDOW_HEIGHT / 3 - INITIAL_ATOM_SPACING_Y + ATOM_SPACING_Y * i,
        true, // isTopAtom
        atomsTandem
      );
    } );

    // add the atoms that are visible in the bottom book
    MAGNIFIED_ATOMS_INFO.bottom.layerDescriptions.forEach( ( layerDescription, i ) => {
      addAtomRow(
        this,
        layerDescription,
        DEFAULT_ROW_START_X_POSITION,
        2 * FrictionConstants.MAGNIFIER_WINDOW_HEIGHT / 3 + ATOM_SPACING_Y * i,
        false, // isTopAtom
        atomsTandem
      );
    } );

    // set distance between atoms and set the amplitude if they are in contact
    this.topBookPositionProperty.link( ( newPosition, oldPosition ) => {

      // don't do further calculations if setting state
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.hintProperty.set( false );

        oldPosition = oldPosition || Vector2.ZERO;
        this.distanceBetweenBooksProperty.set( this.distanceBetweenBooksProperty.get() - ( newPosition.minus( oldPosition ) ).y );
        if ( this.contactProperty.get() ) {
          const dx = Math.abs( newPosition.x - oldPosition.x );
          const newValue = this.vibrationAmplitudeProperty.get() + dx * HEATING_MULTIPLIER;
          this.vibrationAmplitudeProperty.set( Math.min( newValue, MAGNIFIED_ATOMS_INFO.vibrationAmplitude.max ) );
        }
      }
    } );

    // shearing check
    this.vibrationAmplitudeProperty.link( amplitude => {
      if ( amplitude > MAGNIFIED_ATOMS_INFO.shearingLimit && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.tryToShearOff();
      }
    } );
  }

  /**
   * Move forward in time
   * @param {number} dt - in seconds
   * @public
   */
  step( dt ) {

    // step the atoms, which is how they vibrate and move away if they shear off
    for ( let i = 0; i < this.atoms.length; i++ ) {
      this.atoms[ i ].step( dt );
    }

    // cool the atoms
    let amplitude = this.vibrationAmplitudeProperty.get() - this.scheduledShearingAmount;
    amplitude = Math.max( MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min, amplitude * ( 1 - dt * COOLING_RATE ) );
    this.vibrationAmplitudeProperty.set( amplitude );

    this.scheduledShearingAmount = 0;
  }

  /**
   * Restores the initial conditions.
   * @public
   */
  reset() {
    this.vibrationAmplitudeProperty.reset();
    this.topBookPositionProperty.reset();
    this.distanceBetweenBooksProperty.reset();
    this.topBookDragBoundsProperty.value.setMaxY( this.distanceBetweenBooksProperty.value );
    this.topBookDragBoundsProperty.notifyListenersStatic(); // Just to be safe
    this.atomRowsToShearOffProperty.reset();
    this.successfullyInteractedWithProperty.reset();
    this.hintProperty.reset();
    this.numberOfAtomsShearedOffProperty.reset();
    this.atoms.forEach( atom => {
      atom.reset();
    } );
  }

  /**
   * determine whether an atom is available to be sheared off and, if so, shear off it
   * @private
   */
  tryToShearOff() {

    // only if this value points to a proper index in shearableAtomsByRow. If negative, there are likely no more shearable rows
    if ( this.atomRowsToShearOffProperty.get() > 0 ) {

      // determine whether the current row is fully sheared off and, if so, move to the next row
      const currentRowOfShearableAtoms = this.shearableAtomsByRow[ this.atomRowsToShearOffProperty.get() - 1 ];

      // if there are any rows of shearable atoms left, shear off one
      if ( currentRowOfShearableAtoms.length > 0 ) {

        // make a list of all atoms in this row that have not yet sheared off
        const notYetShearedAtoms = currentRowOfShearableAtoms.filter( atom => !atom.isShearedOff );

        assert && assert(
          notYetShearedAtoms.length > 0,
          'should never encounter this case, if we do, something is wrong in logic above'
        );

        // randomly choose an non-sheared-off atom and shear off it
        const atomsToShearOff = dotRandom.sample( notYetShearedAtoms );
        atomsToShearOff.shearOff();
        this.shearedOffEmitter.emit();

        // cause some cooling due to shearing
        this.scheduledShearingAmount = this.scheduledShearingAmount + SHEAR_OFF_AMPLITUDE_REDUCTION;
      }

      const isCurrentRowFullyShearedOff = _.every( currentRowOfShearableAtoms, atom => atom.isShearedOff );

      // if all atoms in this row are sheared off, move on to the next row
      if ( isCurrentRowFullyShearedOff ) {

        // point one row higher because all of the previous row is sheared off
        this.atomRowsToShearOffProperty.set( this.atomRowsToShearOffProperty.get() - 1 );

        // the current row is totally sheared off, so the distance between the books just increased "one row" worth.
        this.distanceBetweenBooksProperty.set( this.distanceBetweenBooksProperty.get() + MAGNIFIED_ATOMS_INFO.distanceY );

        this.topBookDragBoundsProperty.value.setMaxY( this.topBookDragBoundsProperty.value.bottom + MAGNIFIED_ATOMS_INFO.distanceY );
        this.topBookDragBoundsProperty.notifyListenersStatic(); // Just to be safe
      }
    }
  }
}


// statics
FrictionModel.MAGNIFIED_ATOMS_INFO = MAGNIFIED_ATOMS_INFO;
FrictionModel.THERMOMETER_MIN_TEMP = MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
FrictionModel.THERMOMETER_MAX_TEMP = MAGNIFIED_ATOMS_INFO.shearingLimit * 1.1; // ~7.7

// pdom
FrictionModel.NUMBER_OF_SHEARABLE_ATOMS = NUMBER_OF_SHEARABLE_ATOMS;

// pdom
FrictionModel.VIBRATION_AMPLITUDE_MIN = VIBRATION_AMPLITUDE_MIN;
FrictionModel.VIBRATION_AMPLITUDE_MAX = VIBRATION_AMPLITUDE_MAX;

// pdom - empirically determined value of when the atoms are "pretty much cool and settled"
FrictionModel.AMPLITUDE_SETTLED_THRESHOLD = VIBRATION_AMPLITUDE_MIN + 0.4;

FrictionModel.FrictionModelIO = new IOType( 'FrictionModelIO', {
  valueType: FrictionModel,
  documentation: 'model for the simulation',
  stateSchema: {
    width: NumberIO,
    height: NumberIO,
    bookDraggingScaleFactor: NumberIO,
    scheduledShearingAmount: NumberIO,
    shearableAtomsByRow: ArrayIO( ArrayIO( ReferenceIO( Atom.AtomIO ) ) ),
    atoms: ArrayIO( ReferenceIO( Atom.AtomIO ) )
  }
} );

// helper function to add a layer of atoms to the model
function addAtomRow( frictionModel, layerDescription, rowStartXPos, rowYPos, isTopAtom, parentTandem ) {

  let canShearOff;
  const shearableAtomsRow = [];

  for ( let i = 0; i < layerDescription.length; i++ ) {
    const offset = layerDescription[ i ].offset || 0;
    canShearOff = layerDescription[ i ].canShearOff || false;
    for ( let n = 0; n < layerDescription[ i ].num; n++ ) {
      const atom = new Atom(
        new Vector2( rowStartXPos + ( offset + n ) * MAGNIFIED_ATOMS_INFO.distanceX, rowYPos ),
        frictionModel,
        isTopAtom, {
          parentTandem: parentTandem
        }
      );
      frictionModel.atoms.push( atom );
      if ( canShearOff ) {
        shearableAtomsRow.push( atom );
      }
    }
  }
  if ( canShearOff ) {
    frictionModel.shearableAtomsByRow.push( shearableAtomsRow );
  }
}

friction.register( 'FrictionModel', FrictionModel );

export default FrictionModel;