// Copyright 2017-2018, University of Colorado Boulder

/**
 * Single location of all accessibility strings.  These strings are not meant to be translatable yet.  Rosetta needs
 * some work to provide translators with context for these strings, and we want to receive some community feedback
 * before these strings are submitted for translation.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );

  const FrictionA11yStrings = {

    bookTitleStringPattern: {
      value: '{{bookTitle}} book'
    },
    zoomedInBookTitlePattern: {
      value: 'Zoomed-in {{bookTitleString}}'
    },
    moveInFourDirections: {
      value: 'move in four directions'
    },
    bookHelpText: {
      value: 'Once on book or zoomed-in book, use arrow keys, or letter keys W, A, S, or D to move up, left, down, or right.'
    },
    moveBookWith: {
      value: 'Move book up, left, down, and right with Arrow keys, or with letter keys W, A, S, or D'
    },
    moveInSmallerStepsWith: {
      value: 'Move in smaller steps with Shift plus Arrow keys, Shift plus  letter keys W, A, S, or D'
    },


    //--------------------------------------------------------------------------
    // Amount of atoms strings
    //--------------------------------------------------------------------------

    amountOfAtoms: {
      value: 'Chemistry book has {{comparisonAmount}} jiggling atoms as {{breakAwayAmount}} have broken away. '
    },
    fewer: {
      value: 'fewer'
    },
    farFewer: {
      value: 'far fewer'
    },
    some: {
      value: 'some'
    },
    many: {
      value: 'many'
    },


    //--------------------------------------------------------------------------
    // Jiggle scale strings
    //--------------------------------------------------------------------------

    jiggleALot: {
      value: 'jiggle  a lot'
    },

    jiggleALittle: {
      value: 'jiggle a little'
    },

    jiggleABit: {
      value: 'jiggle a tiny bit'
    },

    // if jiggled state has not settled
    slowingDown: {
      value: 'slowing down'
    },

    //--------------------------------------------------------------------------
    // Temp scale strings
    //--------------------------------------------------------------------------

    superHot: { value: 'super hot' },
    veryHot: { value: 'very hot' },
    hot: { value: 'hot' },
    atWarm: { value: 'warm' },
    atCool: { value: 'cool' },

    temperaturePattern: {
      value: 'surface temperature {{thermometer}}is {{temp}}'
    },
    thermometer: {
      value: 'thermometer '
    },

    // if state has not settled yet
    temperatureDropping: {
      value: 'temperature dropping'
    },

    droppingAsAtomsJiggleLess: {
      value: 'dropping as atoms jiggle less'
    },

    atomsJigglePattern: {
      value: 'atoms {{jiggleAmount}}'
    },

    jiggleClausePattern: {
      value: 'and {{jiggleAmount}}'
    },

    // Entire sentence for jiggling and temp
    jiggleTemperatureScaleSentence: {
      value: 'In zoomed-in view of where books meet, {{temperatureClause}}, {{jigglingClause}}.'
    },

    //--------------------------------------------------------------------------
    // Other summary sentence strings
    //--------------------------------------------------------------------------

    moveChemistryBookSentencePattern: {
      value: 'Move Chemistry book to rub books together{{moveDownToRubHarder}}.'
    },
    moveDownToRubHarder: {
      value: ', move down to rub harder'
    },

    moveDownToRubHarderSentence: {
      value: 'Move down to rub harder.'
    },


    positionMoveDownPattern: {
      value: '{{position}}. {{moveDownToRubHarder}}'
    },

    downRubFastOrSlow: {
      value: 'Down. Rub fast or slow.'
    },

    resetSimMoreObservationSentence: {
      value: 'Reset sim to make more observations.'
    },

    startingChemistryBookPattern: {
      value: '{{relativeChemistryBookSentence}}Chemistry book rests {{lightly}}on top of a Physics book, and is ready to be rubbed against it.'
    },

    lightly: {
      value: 'lighty '
    },

    summarySentencePattern: {
      value: '{{chemistryBookString}} {{jiggleTemperatureScaleSentence}}'
    },


    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    // Interactive Alerts strings
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------


    //--------------------------------------------------------------------------
    // Jiggling/Temperature strings
    //--------------------------------------------------------------------------

    atomsJiggleTinyBitTempCool: {
      value: 'Atoms jiggle a tiny bit, temperature cool'
    },

    // jiggling . . .
    aTinyBit: { value: 'a tiny bit' },
    aLittle: { value: 'a little' },
    aLittleMore: { value: 'a little more' },
    more: { value: 'more' },
    faster: { value: 'faster' },
    evenFaster: { value: 'even faster' },
    superFast: { value: 'super fast' },

    less: { value: 'less' },
    evenLess: { value: 'even less' },
    evenCooler: { value: 'even cooler' },

    // temperature . . .
    cooler: { value: 'cooler' },
    jigglingLess: { value: 'jiggling less' },
    nowCooler: { value: 'now cooler' },
    warmer: { value: 'warmer' },
    nowWarm: { value: 'now warm' },
    evenHotter: { value: 'even hotter' },
    nowHot: { value: 'now hot' },
    nowHotter: { value: 'now hotter' },

    dropping: { value: 'dropping' },

    frictionIncreasingAtomsJigglingTemperaturePattern: {
      value: 'Jiggling {{jigglingAmount}}, {{temperature}}'
    },

    frictionIncreasingAtomsJigglingTemperatureFirstPattern: {
      value: 'Atoms {{jigglingAmount}}, temperature {{temperature}}'
    },

    // ----------------------------------------------
    // very hot cases where we need another string pattern
    capitalizedVeryHot: {
      value: 'Very Hot'
    },
    capitalizedAFew: {
      value: 'A few'
    },
    capitalizedMore: {
      value: 'More'
    },
    breakAwaySentenceFirst: {
      value: '{{temp}}. Atoms break away from chemistry book.'
    },
    breakAwaySentenceAgain: {
      value: '{{temp}}. More atoms break away.'
    },
    breakAwayNoneLeft: {
      value: '{{temp}}. Atoms jiggling very fast.'
    }
  };

  // TODO: This seems it should be factored out, see https://github.com/phetsims/tasks/issues/917
  if ( phet.chipper.queryParameters.stringTest === 'xss' ) {
    for ( let key in FrictionA11yStrings ) {
      FrictionA11yStrings[ key ].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( FrictionA11yStrings ); }

  friction.register( 'FrictionA11yStrings', FrictionA11yStrings );

  return FrictionA11yStrings;
} );