// Copyright 2018, University of Colorado Boulder

/**
 * Node that holds the PDOM content for the screen summary in Friction.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const Node = require( 'SCENERY/nodes/Node' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemperatureDecreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureDecreasingDescriber' );


  // a11y strings
  const summarySentencePatternString = FrictionA11yStrings.summarySentencePattern.value;
  const droppingAsAtomsJiggleLessString = FrictionA11yStrings.droppingAsAtomsJiggleLess.value;
  const atomsJigglePatternString = FrictionA11yStrings.atomsJigglePattern.value;
  const jiggleClausePatternString = FrictionA11yStrings.jiggleClausePattern.value;
  const jiggleTemperatureScaleSentenceString = FrictionA11yStrings.jiggleTemperatureScaleSentence.value;
  const thermometerTemperaturePatternString = FrictionA11yStrings.thermometerTemperaturePattern.value;
  const moveDownToRubHarderString = FrictionA11yStrings.moveDownToRubHarder.value;
  const moveChemistryBookSentencePatternString = FrictionA11yStrings.moveChemistryBookSentencePattern.value;
  const resetSimMoreObservationSentenceString = FrictionA11yStrings.resetSimMoreObservationSentence.value;
  const startingChemistryBookPatternString = FrictionA11yStrings.startingChemistryBookPattern.value;
  const lightlyString = FrictionA11yStrings.lightly.value;
  const amountOfAtomsString = FrictionA11yStrings.amountOfAtoms.value;
  const fewerString = FrictionA11yStrings.fewer.value;
  const farFewerString = FrictionA11yStrings.farFewer.value;
  const someString = FrictionA11yStrings.some.value;
  const manyString = FrictionA11yStrings.many.value;

  // Used for the screen summary sentence to compare how many atoms have evaporated
  const SOME_ATOMS_EVAPORATED_THRESHOLD = FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS / 2;

  /**
   *
   * @param {Object} [options]
   * @constructor
   */
  class FrictionScreenSummaryNode extends Node {
    constructor( model, thermometerMinTemp, thermometerMaxTemp ) {

      super( {
        tagName: 'p'
      } );

      this.thermometerMinTemp = thermometerMinTemp;
      this.thermometerMaxTemp = thermometerMaxTemp;

      // requires an init
      this.updateSummaryString( model );

      // a11y - update the screen summary when the model changes
      let previousTempString = this.amplitudeToTempString( model.amplitudeProperty.value );
      let previousJiggleString = this.amplitudeToJiggleString( model.amplitudeProperty.value );

      // make a11y updates as the amplitude changes in the model, no need to unlink, exists for sim lifetime.
      model.amplitudeProperty.link( ( amplitude ) => {

          // the temperature is decreasing
          var tempDecreasing = TemperatureDecreasingDescriber.getDescriber().tempDecreasing;

          // Not if it is completely cool, so we don't trigger the update too much.
          var amplitudeSettledButNotMin = amplitude < FrictionModel.AMPLITUDE_SETTLED_THRESHOLD && // considered in a "settled" state
                                          amplitude !== FrictionModel.VIBRATION_AMPLITUDE_MIN; // not the minimum amplitude

          // nested if statements so that we don't have to calculate these strings as much
          if ( tempDecreasing ||
               amplitudeSettledButNotMin ||
               this.amplitudeToTempString( amplitude ) !== previousTempString ||
               this.amplitudeToJiggleString( amplitude ) !== previousJiggleString ) {

            // if jiggle or temperature changed, update the string
            this.updateSummaryString( model );
            previousTempString = this.amplitudeToTempString( amplitude ); // compute this again for a more efficient if statement
            previousJiggleString = this.amplitudeToJiggleString( amplitude ); // compute this again for a more efficient if statement

          }
        }
      );

      // exists for the lifetime of the sim, no need to unlink
      model.contactProperty.link( () => { this.updateSummaryString( model );} );
    }


    /**
     * Given the number of atoms that have evaporated from the model so far, get the first screen summary sentence,
     * describing the chemistry book.
     * @param {number} atomsEvaporated
     * @param {BooleanProperty} contactProperty - see FrictionModel
     * @returns {string} the first sentence of the screen summary
     */
    getFirstSummarySentence( atomsEvaporated, contactProperty ) {

      // The first sentence describes the chemistry book.
      let chemistryBookString;

      // There are three ranges based on how many atoms have evaporated

      // "no evaporated atoms"
      if ( atomsEvaporated === 0 ) {
        chemistryBookString = StringUtils.fillIn( startingChemistryBookPatternString, {
          lightly: contactProperty.value ? '' : lightlyString
        } );
      }

      // some evaporated atoms, describe the chemistry book with some atoms "broken away"
      else if ( atomsEvaporated < SOME_ATOMS_EVAPORATED_THRESHOLD ) {
        chemistryBookString = StringUtils.fillIn( amountOfAtomsString, {
          comparisonAmount: fewerString,
          breakAwayAmount: someString
        } );
      }

      // lots of evaporated atoms, describe many missing atoms
      else {
        chemistryBookString = StringUtils.fillIn( amountOfAtomsString, {
          comparisonAmount: farFewerString,
          breakAwayAmount: manyString
        } );
      }

      return chemistryBookString;
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
      let normalized = ( amplitude - this.thermometerMinTemp ) / this.thermometerMaxTemp;
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
      let i = this.amplitudeToIndex( amplitude, FrictionConstants.TEMPERATURE_STRINGS );
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
      let i = this.amplitudeToIndex( amplitude, FrictionConstants.JIGGLE_STRINGS );
      return FrictionConstants.JIGGLE_STRINGS[ i ];
    }

    /**
     * Construct the second screen summary sentence about the zoomed in chemistry book.
     * @param amplitudeProperty
     * @returns {*|string}
     */
    getSecondSummarySentence( amplitudeProperty ) {



      // Default to describing the jiggling of the atoms
      var jiggleAmount = StringUtils.fillIn( atomsJigglePatternString, {
        amount: this.amplitudeToJiggleString( amplitudeProperty.value )
      } );
      var jiggleClause = StringUtils.fillIn( jiggleClausePatternString, {
        jiggleAmount: jiggleAmount
      } );

      // If the temperature is decreasing, then describe the jiggling relatively
      if ( TemperatureDecreasingDescriber.getDescriber().tempDecreasing ) {
        jiggleClause = StringUtils.fillIn( jiggleClausePatternString, {
          jiggleAmount: droppingAsAtomsJiggleLessString
        } );
      }

      // Fill in the current temperature string
      let tempString = StringUtils.fillIn( thermometerTemperaturePatternString, {
        temp: this.amplitudeToTempString( amplitudeProperty.value )
      } );

      // Construct the final sentence from its parts
      return StringUtils.fillIn( jiggleTemperatureScaleSentenceString, {
        jigglingClause: jiggleClause,
        temperatureClause: tempString
      } );
    }

    getThirdSupplementarySentence( contactProperty, numberOfAtomsEvaporated ) {

      // optional end to sentence based on if books are touching
      var moveChemistryBookSentence = StringUtils.fillIn( moveChemistryBookSentencePatternString, {
        moveDownToRubHarder: contactProperty.get() ? '' : moveDownToRubHarderString
      } );

      // Queue moving the book if there are still many atoms left, queue reset if there are many evaporated atoms
      return numberOfAtomsEvaporated > SOME_ATOMS_EVAPORATED_THRESHOLD ?
             resetSimMoreObservationSentenceString : moveChemistryBookSentence;
    }

    /**
     * Update the summary string in the PDOM
     * @private
     * @a11y
     * @param {FrictionModel} model
     */
    updateSummaryString( model ) {

      // FIRST SENTENCE
      let chemistryBookString = this.getFirstSummarySentence( model.numberOfAtomsEvaporated, model.contactProperty );

      // SECOND SENTENCE (ZOOMED-IN)
      let jiggleTempSentence = this.getSecondSummarySentence( model.amplitudeProperty );

      // SUPPLEMENTARY THIRD SENTENCE
      let supplementarySentence = this.getThirdSupplementarySentence( model.contactProperty, model.numberOfAtomsEvaporated );

      this.innerContent = StringUtils.fillIn( summarySentencePatternString, {
        chemistryBookString: chemistryBookString,
        jiggleTemperatureScaleSentence: jiggleTempSentence,
        supplementarySentence: supplementarySentence
      } );
    }
  }

  return friction.register( 'FrictionScreenSummaryNode', FrictionScreenSummaryNode );
} );