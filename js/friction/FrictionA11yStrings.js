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
      value: 'Use arrow keys, or letter keys W, A, S, or D to move book or zoomed-in book up, left, down, or right.'
    },
    moveBookWith: {
      value: 'Move book up, left, down, or right with arrow keys or letter keys W, A, S, or D.'
    },
    moveSlowerWith: {
      value: 'Move slower with with shift plus arrow keys or shift plus letter keys W, A, S, or D.'
    },


    //--------------------------------------------------------------------------
    // Amount of atoms strings
    //--------------------------------------------------------------------------

    amountOfAtoms: {
      value: 'Chemistry book has {{comparisonAmount}} jiggling atoms as {{breakAwayAmount}} have broken away.'
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


    breakAway: {
      value: 'break away'
    },

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

    veryHot: { value: 'very hot' },
    hot: { value: 'hot' },
    atWarm: { value: 'warm' },
    atCool: { value: 'cool' },

    thermometerTemperaturePattern: {
      value: 'surface temperature thermometer is {{temp}}'
    },

    // if state has not settled yet
    temperatureDropping: {
      value: 'temperature dropping'
    },

    // Entire sentence for jiggling and temp
    jiggleTemperatureScaleSentence: {
      value: 'In zoomed-in view of where books meet, atoms {{temperatureClause}}, and {{jigglingClause}}.'
    },

    //--------------------------------------------------------------------------
    // Other summary sentence strings
    //--------------------------------------------------------------------------

    moveChemistryBookSentence: {
      value: 'Move Chemistry book to rub books together.'

    },
    resetSimMoreObservationSentence: {
      value: 'Reset sim to make more observations.'
    },

    startingChemistryBookString: {
      value: 'Chemistry book rests on top of a Physics book, and is ready to be rubbed against it.'
    },

    summarySentencePattern: {
      value: '{{chemistryBookString}} {{jiggleTemperatureScaleSentence}} ' +
             '{{supplementarySentence}}'
    },


    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    // Interactive Alerts strings
    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------


    //--------------------------------------------------------------------------
    // Jiggling/Temperature strings
    //--------------------------------------------------------------------------

    // jiggling . . .
    aTinyBit: { value: 'a tiny bit' },
    aLittle: { value: 'a little' },
    aLittleMore: { value: 'a little more' },
    faster: { value: 'faster' },
    evenFaster: { value: 'even faster' },
    veryFast: { value: 'very fast' },

    less: { value: 'less' },
    evenLess: { value: 'less' },

    // temperature . . .
    isCool: { value: 'is cool' },
    getsWarmer: { value: 'gets warmer' },
    nowWarm: { value: 'now warm' },
    getsHotter: { value: 'gets hotter' },
    nowHot: { value: 'now hot' },

    dropping: { value: 'dropping' },

    // purposeful added space at the end, since it is sometimes optional
    surface: { value: 'surface ' },

    frictionIncreasingTemperatureClausePattern: {
      value: '{{surface}}temperature {{temperature}}'
    },
    frictionIncreasingAtomsJigglingTemperaturePattern: {
      value: 'Atoms jiggling {{jigglingAmount}}, {{temperatureClause}}'
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
    frictionIncreasingVeryHotBreakAway: {
      value: '{{temperature}}. {{numberAtoms}} atoms break away from chemistry book.'
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