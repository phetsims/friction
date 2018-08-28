// Copyright 2013-2018, University of Colorado Boulder

/**
 * Shared constants for the 'Friction' simulation.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );

  // a11y strings
  const breakAwayString = FrictionA11yStrings.breakAway.value;
  const jiggleALotString = FrictionA11yStrings.jiggleALot.value;
  const jiggleALittleString = FrictionA11yStrings.jiggleALittle.value;
  const jiggleABitString = FrictionA11yStrings.jiggleABit.value;
  const veryHotString = FrictionA11yStrings.veryHot.value;
  const hotString = FrictionA11yStrings.hot.value;
  const atWarmString = FrictionA11yStrings.atWarm.value;
  const atCoolString = FrictionA11yStrings.atCool.value;

  let FrictionConstants = {
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

    // a11y - the mappings work well divided into 9 sections (arbitrary, but @terracoda's design diagram fit into 9 well
    // These are only used for the screen summary description in the PDOM, not alerts
    TEMPERATURE_STRINGS: [ atCoolString, atCoolString, atWarmString, atWarmString, atWarmString, hotString, hotString,
      hotString, veryHotString ],
    JIGGLE_STRINGS: [ jiggleABitString, jiggleABitString, jiggleALittleString, jiggleALittleString, jiggleALittleString,
      jiggleALotString, jiggleALotString, jiggleALotString, jiggleALotString ]
  };

  friction.register( 'FrictionConstants', FrictionConstants );

  return FrictionConstants;
} );