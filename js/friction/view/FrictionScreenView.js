// Copyright 2013-2018, University of Colorado Boulder

/**
 * Friction's ScreenView
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const BookNode = require( 'FRICTION/friction/view/book/BookNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const ControlPanelNode = require( 'SCENERY_PHET/accessibility/nodes/ControlPanelNode' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionAlertManager = require( 'FRICTION/friction/view/FrictionAlertManager' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MagnifierNode = require( 'FRICTION/friction/view/magnifier/MagnifierNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayAreaNode = require( 'SCENERY_PHET/accessibility/nodes/PlayAreaNode' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemperatureDecreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureDecreasingDescriber' );
  const TemperatureIncreasingDescriber = require( 'FRICTION/friction/view/describers/TemperatureIncreasingDescriber' );
  const ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // strings
  const chemistryString = require( 'string!FRICTION/chemistry' );
  const physicsString = require( 'string!FRICTION/physics' );

  // a11y strings
  const summarySentencePatternString = FrictionA11yStrings.summarySentencePattern.value;
  const droppingAsAtomsJiggleLessString = FrictionA11yStrings.droppingAsAtomsJiggleLess.value;
  const atomsJigglePatternString = FrictionA11yStrings.atomsJigglePattern.value;
  const jiggleClausePatternString = FrictionA11yStrings.jiggleClausePattern.value;
  const jiggleTemperatureScaleSentenceString = FrictionA11yStrings.jiggleTemperatureScaleSentence.value;
  const thermometerTemperaturePatternString = FrictionA11yStrings.thermometerTemperaturePattern.value;
  const moveChemistryBookSentenceString = FrictionA11yStrings.moveChemistryBookSentence.value;
  const resetSimMoreObservationSentenceString = FrictionA11yStrings.resetSimMoreObservationSentence.value;
  const startingChemistryBookStringString = FrictionA11yStrings.startingChemistryBookString.value;
  const amountOfAtomsString = FrictionA11yStrings.amountOfAtoms.value;
  const fewerString = FrictionA11yStrings.fewer.value;
  const farFewerString = FrictionA11yStrings.farFewer.value;
  const someString = FrictionA11yStrings.some.value;
  const manyString = FrictionA11yStrings.many.value;

  // constants
  const THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
  const THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
  const THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
  const THERMOMETER_BACKGROUND_FILL_COLOR = 'white';
  const THERMOMETER_MIN_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
  const THERMOMETER_MAX_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1; // 7.7???

  const EVAPORATION_LIMIT = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit;

  // Used for the screen summary sentence to compare how many atoms have evaporated
  const SOME_ATOMS_EVAPORATED_THRESHOLD = FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS / 2;

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @constructor
   */
  function FrictionScreenView( model, tandem ) {
    const self = this;
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, model.width, model.height ),
      addScreenSummaryNode: true // opt into the generic screen overview strategy provided by ScreenView.js see https://github.com/phetsims/joist/issues/509
    } );

    // @private
    this.model = model;

    // @private - (a11y) true if there has already been an alert about atoms breaking away
    this.alertedBreakAwayProperty = new BooleanProperty( false );

    // @private (a11y) - will be updated later, see
    this.frictionSummaryNode = new Node( {
      tagName: 'p'
    } );
    this.screenSummaryNode.addChild( this.frictionSummaryNode );

    // a11y initialize the temp increasing describer
    TemperatureIncreasingDescriber.initialize( model );
    TemperatureDecreasingDescriber.initialize( model );

    // requires an init
    this.updateSummaryString( model );

    // a11y - update the screen summary when the model changes
    let previousTempString = this.amplitudeToTempString( model.amplitudeProperty.value );
    let previousJiggleString = this.amplitudeToJiggleString( model.amplitudeProperty.value );

    // make a11y updates as the amplitude changes in the model
    model.amplitudeProperty.link( ( amplitude, oldAmplitude ) => {

      // Update the summary string
      let newTempString = self.amplitudeToTempString( amplitude );
      let newJiggleString = self.amplitudeToJiggleString( amplitude );
      if ( newTempString !== previousTempString || // temperature changed
           newJiggleString !== previousJiggleString ||  // jiggle changed
           TemperatureDecreasingDescriber.getDescriber().tempDecreasing || // the temperature is decreasing

           // if it's settled then update, but not if it is completely cool, so we don't trigger the update too much.
           ( amplitude < FrictionModel.AMPLITUDE_SETTLED_THRESHOLD && amplitude !== FrictionModel.VIBRATION_AMPLITUDE_MIN ) ) {

        self.updateSummaryString( model );
        previousTempString = newTempString;
        previousJiggleString = newJiggleString;
      }

      // Handle the alert when amplitude is high enough to begin evaporating
      if ( amplitude > EVAPORATION_LIMIT && oldAmplitude < EVAPORATION_LIMIT && // just hit evaporation limit
           model.numberOfAtomsEvaporated < FrictionModel.NUMBER_OF_EVAPORABLE_ATOMS ) { // still atoms to evaporate
        FrictionAlertManager.alertAtEvaporationThreshold( this.alertedBreakAwayProperty.value );
        this.alertedBreakAwayProperty.value = true;

      }
    } );

    // lazyLink so that we do not hear the alert on startup
    model.amplitudeProperty.lazyLink( amplitude => {
      if ( amplitude === model.amplitudeProperty.initialValue ) {
        FrictionAlertManager.alertSettledAndCool();
      }
    } );

    // add physics book
    this.addChild( new BookNode( model, physicsString, {
      x: 50,
      y: 225,
      tandem: tandem.createTandem( 'physicsBookNode' )
    } ) );

    // add chemistry book
    let chemistryBookNode = new BookNode( model, chemistryString, {
      x: 65,
      y: 209,
      color: FrictionConstants.TOP_BOOK_COLOR_MACRO,
      drag: true,
      tandem: tandem.createTandem( 'chemistryBookNode' )
    } );
    this.addChild( chemistryBookNode );

    // @private - add magnifier
    this.magnifierNode = new MagnifierNode( model, 195, 425, chemistryString, tandem.createTandem( 'magnifierNode' ), {
      x: 40,
      y: 25,
      layerSplit: true
    } );
    this.addChild( this.magnifierNode );

    // add thermometer
    this.addChild( new ThermometerNode(
      THERMOMETER_MIN_TEMP,
      THERMOMETER_MAX_TEMP,
      model.amplitudeProperty,
      {
        x: 690,
        y: 250,
        tubeHeight: 160,
        tickSpacing: 9,
        lineWidth: 1,
        tubeWidth: 12,
        bulbDiameter: 24,
        majorTickLength: 4,
        minorTickLength: 4,
        fluidMainColor: THERMOMETER_FLUID_MAIN_COLOR,
        fluidHighlightColor: THERMOMETER_FLUID_HIGHLIGHT_COLOR,
        fluidRightSideColor: THERMOMETER_FLUID_RIGHT_SIDE_COLOR,
        backgroundFill: THERMOMETER_BACKGROUND_FILL_COLOR
      }
    ) );

    let playAreaNode = new PlayAreaNode();
    this.addChild( playAreaNode );

    // a11y
    playAreaNode.accessibleOrder = [ chemistryBookNode, this.magnifierNode ];

    // add reset button
    let resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        self.reset();
      },
      radius: 22,
      x: model.width * 0.94,
      y: model.height * 0.9,
      touchAreaDilation: 12,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    let controlAreaNode = new ControlPanelNode();
    this.addChild( controlAreaNode );
    controlAreaNode.accessibleOrder = [ resetAllButton ];
  }


  /**
   * Given the number of atoms that have evaporated from the model so far, get the first screen summary sentence,
   * describing the chemistry book.
   * @param {number} atomsEvaporated
   * @returns {*}
   */
  function getFirstSummarySentence( atomsEvaporated ) {

    // The first sentence describes the chemistry book.
    let chemistryBookString;

    // There are three ranges based on how many atoms have evaporated

    // "no evaporated atoms"
    if ( atomsEvaporated === 0 ) {
      chemistryBookString = startingChemistryBookStringString;
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

  friction.register( 'FrictionScreenView', FrictionScreenView );

  return inherit( ScreenView, FrictionScreenView, {

    /**
     * move forward in time
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step( dt ) {
      this.magnifierNode.step( dt );
    },

    /**
     * Reset the view
     * @private
     */
    reset() {
      this.alertedBreakAwayProperty.reset();
      this.updateSummaryString( this.model );
    },

    /**
     * Implementation to go from amplitude to an index for a list of strings to describe the model amplitude. Either
     * the temperature or the amount of jiggling.
     * @private
     * @param {number} amplitude
     * @param {Array.<string>} stringsList
     * @returns {number}
     */
    amplitudeToIndex( amplitude, stringsList ) {
      if ( amplitude > THERMOMETER_MAX_TEMP ) {
        amplitude = THERMOMETER_MAX_TEMP;
      }

      // cancel out the range
      let normalized = ( amplitude - THERMOMETER_MIN_TEMP ) / THERMOMETER_MAX_TEMP;
      let i = Math.floor( normalized * stringsList.length );

      // to account for javascript rounding problems
      if ( i === stringsList.length ) {
        i = stringsList.length - 1;
      }

      assert && assert( i >= 0 && i < stringsList.length );
      return i;
    },

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
    },

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
    },

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
    },

    /**
     * Update the summary string in the PDOM
     * @private
     * @a11y
     * @param {FrictionModel} model
     */
    updateSummaryString( model ) {

      // FIRST SENTENCE
      let chemistryBookString = getFirstSummarySentence( model.numberOfAtomsEvaporated );

      // SECOND SENTENCE (ZOOMED-IN)
      let jiggleTempSentence = this.getSecondSummarySentence( model.amplitudeProperty );

      // SUPPLEMENTARY THIRD SENTENCE
      // Queue moving the book if there are still many atoms left, queue reset if there are many evaporated atoms
      let supplementarySentence = model.numberOfAtomsEvaporated > SOME_ATOMS_EVAPORATED_THRESHOLD ?
                                  resetSimMoreObservationSentenceString : moveChemistryBookSentenceString;

      this.frictionSummaryNode.innerContent = StringUtils.fillIn( summarySentencePatternString, {
        chemistryBookString: chemistryBookString,
        jiggleTemperatureScaleSentence: jiggleTempSentence,
        supplementarySentence: supplementarySentence
      } );
    }
  } );
} );
