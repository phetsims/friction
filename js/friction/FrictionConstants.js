// Copyright 2013-2022, University of Colorado Boulder

/**
 * Shared constants for the 'Friction' simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import dotRandom from '../../../dot/js/dotRandom.js';
import { Color } from '../../../scenery/js/imports.js';
import friction from '../friction.js';
import FrictionStrings from '../FrictionStrings.js';

// constants
const MAJOR_PENTATONIC_PLAYBACK_RATES = [
  1, Math.pow( 2, 2 / 12 ), Math.pow( 2, 4 / 12 ), Math.pow( 2, 7 / 12 ), Math.pow( 2, 9 / 12 )
];

const jiggleALotString = FrictionStrings.a11y.jiggle.jiggleALot;
const jiggleALittleString = FrictionStrings.a11y.jiggle.jiggleALittle;
const jiggleABitString = FrictionStrings.a11y.jiggle.jiggleABit;
const veryHotString = FrictionStrings.a11y.temperature.veryHot;
const hotString = FrictionStrings.a11y.temperature.hot;
const atWarmString = FrictionStrings.a11y.temperature.atWarm;
const atCoolString = FrictionStrings.a11y.temperature.atCool;

const FrictionConstants = {
  TOP_BOOK_COLOR_MACRO: new Color( 'rgb(125,226,249)' ), // color of the macroscopic view of the book
  TOP_BOOK_COLOR: new Color( 'rgb(125,226,249)' ), // color for the book in the magnified view
  TOP_BOOK_ATOMS_COLOR: new Color( 'rgb( 0, 255, 255 )' ), // color for the atoms in the magnified view
  BOTTOM_BOOK_COLOR_MACRO: new Color( 'rgb( 183, 255, 181 )' ), // color for the macroscopic view of the bottom book
  BOTTOM_BOOK_COLOR: new Color( 'rgb( 187, 255, 187 )' ), // color for the book in the magnified view
  BOTTOM_BOOK_ATOMS_COLOR: new Color( 'rgb( 0, 255, 0 )' ), // color for the bottom book in the magnified view,
  BOOK_TEXT_COLOR: new Color( '#404040' ),
  ATOM_RADIUS: 7, // in model coordinates, empirically determined to have the desired look
  INITIAL_ATOM_SPACING_X: 20, // x-distance between neighboring atoms in the books, excluding any gaps
  INITIAL_ATOM_SPACING_Y: 20, // y-distance between neighboring atoms in the books
  MAGNIFIER_WINDOW_HEIGHT: 300,
  MAGNIFIER_WINDOW_WIDTH: 690,

  // sound - a function for choosing a random playback rate from a one-octave pentatonic scale
  GET_RANDOM_PENTATONIC_PLAYBACK_RATE() {
    return dotRandom.sample( MAJOR_PENTATONIC_PLAYBACK_RATES );
  },

  // pdom - the mappings work well divided into 9 sections (arbitrary, but @terracoda's design diagram fit into 9 well
  // These are only used for the screen summary description in the PDOM, not alerts
  TEMPERATURE_STRINGS: [ atCoolString, atCoolString, atWarmString, atWarmString, atWarmString, hotString, hotString,
    hotString, veryHotString ],
  JIGGLE_STRINGS: [ jiggleABitString, jiggleABitString, jiggleALittleString, jiggleALittleString, jiggleALittleString,
    jiggleALotString, jiggleALotString, jiggleALotString, jiggleALotString ]
};

friction.register( 'FrictionConstants', FrictionConstants );

export default FrictionConstants;