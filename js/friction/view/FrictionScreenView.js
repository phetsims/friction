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
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var BookNode = require( 'FRICTION/friction/view/book/BookNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ControlPanelNode = require( 'SCENERY_PHET/accessibility/nodes/ControlPanelNode' );
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  var FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MagnifierNode = require( 'FRICTION/friction/view/magnifier/MagnifierNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PlayAreaNode = require( 'SCENERY_PHET/accessibility/nodes/PlayAreaNode' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // strings
  var chemistryString = require( 'string!FRICTION/chemistry' );
  var physicsString = require( 'string!FRICTION/physics' );

  // a11y strings
  var summarySentencePatternString = FrictionA11yStrings.summarySentencePattern.value;
  var jiggleTemperatureScaleSentenceString = FrictionA11yStrings.jiggleTemperatureScaleSentence.value;
  var thermometerTemperaturePatternString = FrictionA11yStrings.thermometerTemperaturePattern.value;
  var moveChemistryBookSentenceString = FrictionA11yStrings.moveChemistryBookSentence.value;
  var resetSimMoreObservationSentenceString = FrictionA11yStrings.resetSimMoreObservationSentence.value;

  // constants
  var THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
  var THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
  var THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
  var THERMOMETER_BACKGROUND_FILL_COLOR = 'white';
  var THERMOMETER_MIN_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
  var THERMOMETER_MAX_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1; // 7.7???

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @constructor
   */
  function FrictionScreenView( model, tandem ) {
    var self = this;
    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, model.width, model.height ),
      addScreenSummaryNode: true // opt into the generic screen overview strategy provided by ScreenView.js see https://github.com/phetsims/joist/issues/509
    } );

    // @private
    this.model = model;

    // @private (a11y)
    this.frictionSummaryNode = new Node( {
      tagName: 'p',
      innerContent: 'A Chemistry book rests on top of a Physics book, and is ready to be rubbed against it. ' +
                    'In a zoomed-in view of where books meet, atoms jiggle {{a tiny bit}}, and a thermometer is ' +
                    '{{at cool}}. Move Chemistry book to rub books together.'
    } );
    this.screenSummaryNode.addChild( this.frictionSummaryNode );


    // a11y - update the screen summary when the model changes
    var previousTempString = this.amplitudeToTempString( model.amplitudeProperty );
    var previousJiggleString = this.amplitudeToJiggleString( model.amplitudeProperty );
    model.amplitudeProperty.link( ( amplitude ) => {
      var newTempString = self.amplitudeToTempString( amplitude );
      var newJiggleString = self.amplitudeToJiggleString( amplitude );
      if ( newTempString !== previousTempString || newJiggleString !== previousJiggleString ) {
        this.updateSummaryString( model );
        previousTempString = newTempString;
        previousJiggleString = newJiggleString;
      }
    } );

    // add physics book
    this.addChild( new BookNode( model, physicsString, {
      x: 50,
      y: 225,
      tandem: tandem.createTandem( 'physicsBookNode' )
    } ) );

    // add chemistry book
    var chemistryBookNode = new BookNode( model, chemistryString, {
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

    var playAreaNode = new PlayAreaNode();
    this.addChild( playAreaNode );
    playAreaNode.accessibleOrder = [ chemistryBookNode, this.magnifierNode ];

    // add reset button
    var resetAllButton = new ResetAllButton( {
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

    var controlAreaNode = new ControlPanelNode();
    this.addChild( controlAreaNode );
    controlAreaNode.accessibleOrder = [ resetAllButton ];
  }

  friction.register( 'FrictionScreenView', FrictionScreenView );

  return inherit( ScreenView, FrictionScreenView, {

    /**
     * move forward in time
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step: function( dt ) {
      this.magnifierNode.step( dt );
    },

    /**
     * Reset the view
     * @private
     */
    reset: function() {
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
    amplitudeToIndex: function( amplitude, stringsList ) {
      if ( amplitude > THERMOMETER_MAX_TEMP ) {
        amplitude = THERMOMETER_MAX_TEMP;
      }

      // cancel out the range
      var normalized = ( amplitude - THERMOMETER_MIN_TEMP ) / THERMOMETER_MAX_TEMP;
      var i = Math.floor( normalized * stringsList.length );

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
    amplitudeToTempString: function( amplitude ) {
      var i = this.amplitudeToIndex( amplitude, FrictionConstants.TEMPERATURE_STRINGS );
      return FrictionConstants.TEMPERATURE_STRINGS[ i ];
    },

    /**
     * Map the amplitude of the model to a "jiggle" string
     * @private
     * @a11y
     * @param {number} amplitude
     * @returns {string} the "jiggle" amount string based on the amplitude of the model
     */
    amplitudeToJiggleString: function( amplitude ) {
      var i = this.amplitudeToIndex( amplitude, FrictionConstants.JIGGLE_STRINGS );
      return FrictionConstants.JIGGLE_STRINGS[ i ];
    },

    /**
     * Update the summary string in the PDOM
     * @private
     * @a11y
     * @param {FrictionModel} model
     */
    updateSummaryString: function( model ) {
      var tempString = StringUtils.fillIn( thermometerTemperaturePatternString, {
        temp: this.amplitudeToTempString( model.amplitudeProperty.value )
      } );

      var jiggleTempSentence = StringUtils.fillIn( jiggleTemperatureScaleSentenceString, {
        jigglingClause: this.amplitudeToJiggleString( model.amplitudeProperty.value ),
        temperatureClause: tempString
      } );

      // arbitrary number of atoms needed to evaporate before displaying different info in the PDOM
      var NUMBER_OF_ATOMS_EVAPORATED_THRESHOLD = 15;
      var supplementarySentence = model.numberOfAtomsEvaporated > NUMBER_OF_ATOMS_EVAPORATED_THRESHOLD ? resetSimMoreObservationSentenceString : moveChemistryBookSentenceString;

      this.frictionSummaryNode.innerContent = StringUtils.fillIn( summarySentencePatternString, {
        jiggleTemperatureScaleSentence: jiggleTempSentence,
        supplementarySentence: supplementarySentence
      } );
    }
  } );
} );
