// Copyright 2018-2021, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Friction.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node } from '../../../../scenery/js/imports.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionConstants from '../FrictionConstants.js';
import FrictionModel from '../model/FrictionModel.js';

// constants
const summarySentencePatternString = frictionStrings.a11y.screenSummary.summarySentencePattern;
const droppingAsAtomsJiggleLessString = frictionStrings.a11y.screenSummary.droppingAsAtomsJiggleLess;
const atomsJigglePatternString = frictionStrings.a11y.screenSummary.atomsJigglePattern;
const jiggleClausePatternString = frictionStrings.a11y.screenSummary.jiggleClausePattern;
const jiggleTemperatureScaleSentenceString = frictionStrings.a11y.screenSummary.jiggleTemperatureScaleSentence;
const thermometerString = StringUtils.fillIn( frictionStrings.a11y.temperature.thermometer, { space: ' ' } );
const temperaturePatternString = frictionStrings.a11y.temperature.pattern;
const grabChemistryBookPlayString = frictionStrings.a11y.screenSummary.grabChemistryBookPlay;
const resetSimMoreObservationSentenceString = frictionStrings.a11y.resetSimMoreObservationSentence;
const startingChemistryBookPatternString = frictionStrings.a11y.screenSummary.startingChemistryBookPattern;
const lightlyString = StringUtils.fillIn( frictionStrings.a11y.lightly, { space: ' ' } );
const amountOfAtomsString = frictionStrings.a11y.amountOfAtoms.sentence;
const fewerString = frictionStrings.a11y.amountOfAtoms.fewer;
const farFewerString = frictionStrings.a11y.amountOfAtoms.farFewer;
const someString = frictionStrings.a11y.amountOfAtoms.some;
const manyString = frictionStrings.a11y.amountOfAtoms.many;

class FrictionScreenSummaryNode extends Node {

  /**
   *
   * @param contactProperty
   * @param numberOfAtomsShearedOffProperty
   * @param vibrationAmplitudeProperty
   * @param thermometerMinTemp
   * @param thermometerMaxTemp
   * @param temperatureDecreasingAlerter
   */
  constructor( contactProperty, numberOfAtomsShearedOffProperty, vibrationAmplitudeProperty, thermometerMinTemp,
               thermometerMaxTemp, temperatureDecreasingAlerter ) {

    super();

    // @private
    this.contactProperty = contactProperty;
    this.numberOfAtomsShearedOffProperty = numberOfAtomsShearedOffProperty;
    this.vibrationAmplitudeProperty = vibrationAmplitudeProperty;
    this.booksParagraph = new Node( { tagName: 'p' } );
    this.interactionHintParagraph = new Node( { tagName: 'p' } );
    this.thermometerMinTemp = thermometerMinTemp;
    this.thermometerMaxTemp = thermometerMaxTemp;

    // requires an init
    this.updateSummaryString( );

    // pdom - update the screen summary when the model changes
    let previousTempString = this.amplitudeToTempString( this.vibrationAmplitudeProperty.value );
    let previousJiggleString = this.amplitudeToJiggleString( this.vibrationAmplitudeProperty.value );

    // make a11y updates as the amplitude changes in the model, no need to unlink, exists for sim lifetime.
    this.vibrationAmplitudeProperty.link( amplitude => {

        // the temperature is decreasing
        const tempDecreasing = temperatureDecreasingAlerter.tempDecreasing;

        // Not if it is completely cool, so we don't trigger the update too much.
        const amplitudeSettledButNotMin = amplitude < FrictionModel.AMPLITUDE_SETTLED_THRESHOLD && // considered in a "settled" state
                                          amplitude !== FrictionModel.VIBRATION_AMPLITUDE_MIN; // not the minimum amplitude

        // nested if statements so that we don't have to calculate these strings as much
        if ( tempDecreasing ||
             amplitudeSettledButNotMin ||
             this.amplitudeToTempString( amplitude ) !== previousTempString ||
             this.amplitudeToJiggleString( amplitude ) !== previousJiggleString ) {

          // if jiggle or temperature changed, update the string
          this.updateSummaryString( );
          previousTempString = this.amplitudeToTempString( amplitude ); // compute this again for a more efficient if statement
          previousJiggleString = this.amplitudeToJiggleString( amplitude ); // compute this again for a more efficient if statement

        }
      }
    );

    // exists for the lifetime of the sim, no need to unlink
    this.contactProperty.link( () => { this.updateSummaryString( );} );

    this.mutate( {
      children: [ this.booksParagraph, this.interactionHintParagraph ],

      // pdom
      tagName: 'div'
    } );
  }


  /**
   * Given the number of atoms that have sheared off from the model so far, get the first screen summary sentence,
   * describing the chemistry book.
   * @param {number} numberAtomsShearedOff
   * @returns {string} the first sentence of the screen summary
   * @private
   */
  getFirstSummarySentence( numberAtomsShearedOff ) {

    // There are three ranges based on how many atoms have sheared off

    let relativeChemistryBookSentence = null;
    // "no shearable atoms"
    if ( numberAtomsShearedOff === 0 ) {
      relativeChemistryBookSentence = ''; // blank initial sentence of "First Sentence"
    }

    // some atoms have sheared off, describe the chemistry book with some atoms "broken away"
    else if ( numberAtomsShearedOff < FrictionModel.NUMBER_OF_SHEARABLE_ATOMS ) {
      relativeChemistryBookSentence = StringUtils.fillIn( amountOfAtomsString, {
        comparisonAmount: fewerString,
        breakAwayAmount: someString,
        space: ' '
      } );
    }

    // lots of atoms sheared off, describe many missing atoms
    else {
      relativeChemistryBookSentence = StringUtils.fillIn( amountOfAtomsString, {
        comparisonAmount: farFewerString,
        breakAwayAmount: manyString,
        space: ' '
      } );
    }

    return StringUtils.fillIn( startingChemistryBookPatternString, {
      lightly: this.contactProperty.value ? '' : lightlyString,
      relativeChemistryBookSentence: relativeChemistryBookSentence
    } );
  }

  /**
   * Implementation to go from amplitude to an index for a list of strings to describe the model amplitude. Either
   * the temperature or the amount of jiggling.
   * @private
   * @param {number} amplitude
   * @param {Array.<string>} stringsList
   * @returns {number}
   */
  amplitudeToIndex( amplitude, stringsList ) {
    if ( amplitude > this.thermometerMaxTemp ) {
      amplitude = this.thermometerMaxTemp;
    }

    // cancel out the range
    const normalized = ( amplitude - this.thermometerMinTemp ) / this.thermometerMaxTemp;
    let i = Math.floor( normalized * stringsList.length );

    // to account for javascript rounding problems
    if ( i === stringsList.length ) {
      i = stringsList.length - 1;
    }

    assert && assert( i >= 0 && i < stringsList.length );
    return i;
  }

  /**
   * Map the amplitude of the model to a temperature string
   * @private
   * @a11y
   * @param {number} amplitude
   * @returns {string} the temp string based on the amplitude of the model
   */
  amplitudeToTempString( amplitude ) {
    const i = this.amplitudeToIndex( amplitude, FrictionConstants.TEMPERATURE_STRINGS );
    return FrictionConstants.TEMPERATURE_STRINGS[ i ];
  }

  /**
   * Map the amplitude of the model to a "jiggle" string
   * @private
   * @a11y
   * @param {number} amplitude
   * @returns {string} the "jiggle" amount string based on the amplitude of the model
   */
  amplitudeToJiggleString( amplitude ) {
    const i = this.amplitudeToIndex( amplitude, FrictionConstants.JIGGLE_STRINGS );
    return FrictionConstants.JIGGLE_STRINGS[ i ];
  }

  /**
   * Construct the second screen summary sentence about the zoomed in chemistry book.
   * @param {Property.<number>} vibrationAmplitudeProperty
   * @returns {*|string}
   * @private
   */
  getSecondSummarySentence( vibrationAmplitudeProperty ) {

    // {{boolean}} is sim "in transition"? meaning it is changing, because it isn't settled (settled is the opposite of "in transition"
    const inTransition = vibrationAmplitudeProperty.value > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD;


    // Default to describing the jiggling of the atoms
    const jiggleAmount = StringUtils.fillIn( atomsJigglePatternString, {
      jiggleAmount: this.amplitudeToJiggleString( vibrationAmplitudeProperty.value )
    } );
    let jiggleClause = StringUtils.fillIn( jiggleClausePatternString, {
      jiggleAmount: jiggleAmount
    } );

    // If the temperature is decreasing, then describe the jiggling relatively
    if ( inTransition ) {
      jiggleClause = StringUtils.fillIn( jiggleClausePatternString, {
        jiggleAmount: droppingAsAtomsJiggleLessString
      } );
    }

    // Fill in the current temperature string
    const tempString = StringUtils.fillIn( temperaturePatternString, {
      temp: this.amplitudeToTempString( vibrationAmplitudeProperty.value ),
      thermometer: inTransition ? '' : thermometerString
    } );

    // Construct the final sentence from its parts
    return StringUtils.fillIn( jiggleTemperatureScaleSentenceString, {
      jigglingClause: jiggleClause,
      temperatureClause: tempString
    } );
  }

  /**
   * @private
   * @param {number} numberOfAtomsShearedOff
   * @returns {string}
   */
  getThirdSupplementarySentence( numberOfAtomsShearedOff ) {

    // Queue moving the book if there are still many atoms left, queue reset if there are many atoms sheared off
    return numberOfAtomsShearedOff === FrictionModel.NUMBER_OF_SHEARABLE_ATOMS ?
           resetSimMoreObservationSentenceString : grabChemistryBookPlayString;
  }

  /**
   * Update the summary string in the PDOM
   * @private
   * @a11y
   */
  updateSummaryString() {

    this.booksParagraph.innerContent = this.getCurrentDetailsString();

    // SUPPLEMENTARY THIRD SENTENCE
    this.interactionHintParagraph.innerContent = this.getHintString();
  }

  /**
   * @public
   * @returns {string}
   */
  getCurrentDetailsString() {

    // FIRST SENTENCE
    const chemistryBookString = this.getFirstSummarySentence( this.numberOfAtomsShearedOffProperty.value );

    // SECOND SENTENCE (ZOOMED-IN)
    const jiggleTempSentence = this.getSecondSummarySentence( this.vibrationAmplitudeProperty );

    return StringUtils.fillIn( summarySentencePatternString, {
      chemistryBookString: chemistryBookString,
      jiggleTemperatureScaleSentence: jiggleTempSentence
    } );
  }

  /**
   * @public
   * @returns {string}
   */
  getHintString() {
    return this.numberOfAtomsShearedOffProperty.value === FrictionModel.NUMBER_OF_SHEARABLE_ATOMS ? resetSimMoreObservationSentenceString :
           this.contactProperty.value ? frictionStrings.a11y.screenSummary.continueRubbing :
           frictionStrings.a11y.screenSummary.grabChemistryBookPlay;
  }
}

friction.register( 'FrictionScreenSummaryNode', FrictionScreenSummaryNode );
export default FrictionScreenSummaryNode;