// Copyright 2013-2020, University of Colorado Boulder

/**
 * Friction's ScreenView
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import SelfVoicingInputListener from '../../../../scenery-phet/js/accessibility/speaker/SelfVoicingInputListener.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import selfVoicingManager from '../../../../scenery/js/accessibility/speaker/selfVoicingManager.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import moleculeBreakOffSound from '../../../sounds/break-off-autosinfonie-spatialized_mp3.js';
import bookContactSound from '../../../sounds/contact-lower_mp3.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionConstants from '../FrictionConstants.js';
import FrictionModel from '../model/FrictionModel.js';
import BookNode from './book/BookNode.js';
import BookRubSoundGenerator from './BookRubSoundGenerator.js';
import CoolingSoundGenerator from './CoolingSoundGenerator.js';
import BookMovementDescriber from './describers/BookMovementDescriber.js';
import BreakAwayDescriber from './describers/BreakAwayDescriber.js';
import TemperatureDecreasingDescriber from './describers/TemperatureDecreasingDescriber.js';
import TemperatureIncreasingDescriber from './describers/TemperatureIncreasingDescriber.js';
import FrictionScreenSummaryNode from './FrictionScreenSummaryNode.js';
import MagnifierNode from './magnifier/MagnifierNode.js';
import sceneryPhetStrings from '../../../../scenery-phet/js/sceneryPhetStrings.js';
import MoleculeMotionSoundGenerator from './MoleculeMotionSoundGenerator.js';

// constants
const chemistryString = frictionStrings.chemistry;
const physicsString = frictionStrings.physics;
const singleScreenPatternString = sceneryPhetStrings.a11y.selfVoicing.simSection.screenSummary.singleScreenIntroPattern;
const overviewPatternString = frictionStrings.a11y.selfVoicing.overviewPattern;
const overviewHintString = frictionStrings.a11y.selfVoicing.overviewHint;
const titleString = frictionStrings.friction.title;
const moveBookHintString = frictionStrings.a11y.selfVoicing.moveBookHint;
const resetSimMoreObservationSentenceString = frictionStrings.a11y.resetSimMoreObservationSentence;
const resetAllString = sceneryPhetStrings.a11y.resetAll.label;
const resetAllAlertString = sceneryPhetStrings.a11y.resetAll.alert;

const THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
const THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
const THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
const THERMOMETER_BACKGROUND_FILL_COLOR = 'white';
const THERMOMETER_MIN_TEMP = FrictionModel.THERMOMETER_MIN_TEMP;
const THERMOMETER_MAX_TEMP = FrictionModel.THERMOMETER_MAX_TEMP;

class FrictionScreenView extends ScreenView {

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    // pdom - initialize the describers for auditory descriptions and alerts.
    const temperatureIncreasingDescriber = new TemperatureIncreasingDescriber( model );
    const temperatureDecreasingDescriber = new TemperatureDecreasingDescriber( model );
    const breakAwayDescriber = new BreakAwayDescriber( model );
    const bookMovementDescriber = new BookMovementDescriber( model );

    // pdom
    const frictionScreenSummaryNode = new FrictionScreenSummaryNode( model, THERMOMETER_MIN_TEMP, THERMOMETER_MAX_TEMP,
      temperatureDecreasingDescriber );

    super( {
      layoutBounds: new Bounds2( 0, 0, model.width, model.height ),
      screenSummaryContent: frictionScreenSummaryNode,
      tandem: tandem
    } );

    // @private {FrictionScreenSummaryNode}
    this.frictionScreenSummaryNode = frictionScreenSummaryNode;

    // @private {FrictionModel}
    this.model = model;

    // add physics book
    this.addChild( new BookNode( model, physicsString, temperatureIncreasingDescriber, temperatureDecreasingDescriber,
      bookMovementDescriber, tandem.createTandem( 'bottomBookNode' ), {
        x: 50,
        y: 225
      } ) );

    // add chemistry book
    const chemistryBookNode = new BookNode( model, chemistryString, temperatureIncreasingDescriber,
      temperatureDecreasingDescriber,
      bookMovementDescriber, tandem.createTandem( 'topBookNode' ), {
        x: 65,
        y: 209,
        color: FrictionConstants.TOP_BOOK_COLOR_MACRO,
        drag: true
      } );
    this.addChild( chemistryBookNode );

    // create and hook up the sound that will be produced when the books come into contact with one another
    const bookContactSoundClip = new SoundClip( bookContactSound, { initialOutputLevel: 0.06 } );
    soundManager.addSoundGenerator( bookContactSoundClip );
    model.contactProperty.link( contact => {
      if ( contact ) {
        bookContactSoundClip.play();
      }
    } );

    // @private {BookRubSoundGenerator} - sound generator for when the books rub together
    this.bookRubSoundGenerator = new BookRubSoundGenerator( model.topBookPositionProperty, model.contactProperty, {
      maxOutputLevel: 0.3
    } );
    soundManager.addSoundGenerator( this.bookRubSoundGenerator );

    // @private - add magnifier
    this.magnifierNode = new MagnifierNode( model, 195, 425, chemistryString, temperatureIncreasingDescriber,
      temperatureDecreasingDescriber,
      bookMovementDescriber, tandem.createTandem( 'atomicView' ), {
        x: 40,
        y: 25,
        layerSplit: true
      } );
    this.addChild( this.magnifierNode );

    // add thermometer
    this.addChild( new ThermometerNode(
      THERMOMETER_MIN_TEMP,
      THERMOMETER_MAX_TEMP,
      model.vibrationAmplitudeProperty,
      {
        x: 690,
        y: 250,
        tubeHeight: 160,
        tickSpacing: 9,
        lineWidth: 1,
        tubeWidth: 12,
        bulbDiameter: 24,
        glassThickness: 3,
        majorTickLength: 4,
        minorTickLength: 4,
        fluidMainColor: THERMOMETER_FLUID_MAIN_COLOR,
        fluidHighlightColor: THERMOMETER_FLUID_HIGHLIGHT_COLOR,
        fluidRightSideColor: THERMOMETER_FLUID_RIGHT_SIDE_COLOR,
        backgroundFill: THERMOMETER_BACKGROUND_FILL_COLOR,

        // phet-io
        tandem: tandem.createTandem( 'thermometerNode' )
      }
    ) );

    // pdom
    this.pdomPlayAreaNode.pdomOrder = [ chemistryBookNode, this.magnifierNode ];

    // add reset button
    const resetAllButton = new ResetAllButton( {
      listener: () => {

        phet.joist.sim.voicingUtteranceQueue && phet.joist.sim.voicingUtteranceQueue.setEnabled( true );

        model.reset();
        this.reset();

        if ( phet.joist.sim.voicingUtteranceQueue ) {
          phet.joist.sim.voicingUtteranceQueue.enabled = true;

          // when pressed, self-voicing content should speak both the label and the alert
          const resetAlert = selfVoicingManager.collectResponses( resetAllString, resetAllAlertString );
          phet.joist.sim.voicingUtteranceQueue.addToBack( resetAlert );
        }
      },
      radius: 22,
      x: model.width * 0.94,
      y: model.height * 0.9,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    resetAllButton.addInputListener( new SelfVoicingInputListener( {
      highlightTarget: resetAllButton
    } ) );

    // create and register the sound that will be played to indicate changes to the rate of molecule motion
    soundManager.addSoundGenerator( new MoleculeMotionSoundGenerator( model.vibrationAmplitudeProperty, {
      initialOutputLevel: 0,
      maxOutputLevel: 0.175
    } ) );

    // create and hook up the sound that is played when molecules break off from the top book
    const moleculeBreakOffSoundClip = new SoundClip( moleculeBreakOffSound, { initialOutputLevel: 0.05 } );
    soundManager.addSoundGenerator( moleculeBreakOffSoundClip );
    model.evaporationEmitter.addListener( () => {

      // don't play for every evaporated molecule or it's too noisy
      if ( model.numberOfAtomsEvaporated % 4 === 0 ) {

        // choose a playback rate
        moleculeBreakOffSoundClip.playbackRate = FrictionConstants.GET_RANDOM_PENTATONIC_PLAYBACK_RATE();

        // play the sound
        moleculeBreakOffSoundClip.play();
      }
    } );

    // @private {CoolingSoundGenerator} - sound generator that produces the "cooling off" sound
    this.coolingSoundGenerator = new CoolingSoundGenerator( model.vibrationAmplitudeProperty, {
      maxOutputLevel: 0.75
    } );
    soundManager.addSoundGenerator( this.coolingSoundGenerator, {
      sonificationLevel: SoundLevelEnum.ENHANCED
    } );

    // add a node that creates a "play area" accessible section in the PDOM
    this.pdomControlAreaNode.pdomOrder = [ resetAllButton ];

    // @private
    this.resetFrictionScreenView = () => {

      // pdom - among other things, this will reset the grab button cuing.
      this.magnifierNode.reset();
      chemistryBookNode.reset();

      // pdom, reset PDOM and reset alerting types
      temperatureDecreasingDescriber.reset();
      temperatureIncreasingDescriber.reset();
      breakAwayDescriber.reset();
      bookMovementDescriber.reset();
      this.frictionScreenSummaryNode.updateSummaryString();
    };
  }

  /**
   * move forward in time
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step( dt ) {
    this.magnifierNode.step( dt );
    this.bookRubSoundGenerator.step( dt );
    this.coolingSoundGenerator.step( dt );
  }

  /**
   * Reset the view
   * @private
   */
  reset() {
    this.resetFrictionScreenView();
  }

  /**
   * Implement to support the self-voicing Toolbar for the sim. When the "Overview" button is pressed, this is the
   * content that will be spoken to describe this screen.
   * @public
   *
   * @returns {string}
   */
  getSelfVoicingOverviewContent() {
    const introString = StringUtils.fillIn( singleScreenPatternString, {
      sim: titleString
    } );

    return StringUtils.fillIn( overviewPatternString, {
      intro: introString,
      overviewHint: overviewHintString
    } );
  }

  /**
   * Implement to support the self-voicing Toolbar for the sim. When the "Details" button is pressed, this is the
   * content that will be spoken to describe this screen.
   * @public
   *
   * @returns {string}
   */
  getSelfVoicingDetailsContent() {
    return this.frictionScreenSummaryNode.getSelfVoicingDetailsContent();
  }

  /**
   * Implement to support the self-voicing toolbar for the sim. When the "Hint" button is pressed this is the content
   * that will be spoken to guide the user toward an interaction.
   * @public
   *
   * @returns {string}
   */
  getSelfVoicingHintContent() {
    return this.model.numberOfAtomsEvaporated > FrictionModel.HALF_OF_EVAPORABLE_ATOMS ?
           resetSimMoreObservationSentenceString : moveBookHintString;
  }
}

friction.register( 'FrictionScreenView', FrictionScreenView );
export default FrictionScreenView;