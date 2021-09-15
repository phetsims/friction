// Copyright 2013-2021, University of Colorado Boulder

/**
 * Friction's ScreenView
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import voicingUtteranceQueue from '../../../../scenery/js/accessibility/voicing/voicingUtteranceQueue.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import ResponsePacket from '../../../../utterance-queue/js/ResponsePacket.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import moleculeBreakOffSound from '../../../sounds/break-off-autosinfonie-spatialized_mp3.js';
import bookContactSound from '../../../sounds/contact-lower_mp3.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';
import FrictionConstants from '../FrictionConstants.js';
import FrictionModel from '../model/FrictionModel.js';
import BookMovementAlerter from './book/BookMovementAlerter.js';
import BookNode from './book/BookNode.js';
import BookRubSoundGenerator from './book/BookRubSoundGenerator.js';
import BreakAwayAlerter from './BreakAwayAlerter.js';
import CoolingSoundGenerator from './CoolingSoundGenerator.js';
import FrictionScreenSummaryNode from './FrictionScreenSummaryNode.js';
import GrabbedDescriber from './GrabbedDescriber.js';
import MagnifierNode from './magnifier/MagnifierNode.js';
import MoleculeMotionSoundGenerator from './MoleculeMotionSoundGenerator.js';
import TemperatureDecreasingAlerter from './TemperatureDecreasingAlerter.js';
import TemperatureIncreasingAlerter from './TemperatureIncreasingAlerter.js';

// constants
const chemistryString = frictionStrings.chemistry;
const physicsString = frictionStrings.physics;

const THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
const THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
const THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
const THERMOMETER_BACKGROUND_FILL_COLOR = 'white';
const THERMOMETER_MIN_TEMP = FrictionModel.THERMOMETER_MIN_TEMP;
const THERMOMETER_MAX_TEMP = FrictionModel.THERMOMETER_MAX_TEMP;

const atomsJiggleTinyBitTempCoolString = frictionStrings.a11y.atomsJiggleTinyBitTempCool;

const atomsJiggleTinyBitUtterance = new Utterance( {
  alert: new ResponsePacket( { contextResponse: atomsJiggleTinyBitTempCoolString } ),
  announcerOptions: {
    cancelOther: false
  }
} );


class FrictionScreenView extends ScreenView {

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    // To pass to super
    const screenSummaryNodeContainer = new Node();

    super( {
      layoutBounds: new Bounds2( 0, 0, model.width, model.height ),
      screenSummaryContent: screenSummaryNodeContainer,
      tandem: tandem
    } );

    const descriptionAlertNodeOptions = {
      descriptionAlertNode: this
    };

    // pdom - initialize the describers for auditory descriptions and alerts.
    const temperatureIncreasingAlerter = new TemperatureIncreasingAlerter( model, descriptionAlertNodeOptions );
    const temperatureDecreasingAlerter = new TemperatureDecreasingAlerter( model, descriptionAlertNodeOptions );
    const breakAwayAlerter = new BreakAwayAlerter( model, descriptionAlertNodeOptions );
    const bookMovementAlerter = new BookMovementAlerter( model, descriptionAlertNodeOptions );
    const grabbedDescriber = new GrabbedDescriber( model.contactProperty, model.successfullyInteractedWithProperty );
    const alertSettledAndCool = () => {
      this.alertDescriptionUtterance( atomsJiggleTinyBitUtterance );

      voicingUtteranceQueue.addToBack( atomsJiggleTinyBitUtterance );
    };

    let amplitudeIncreasedEnoughForSettledAndCoolAlert = false;

    // handle the "settled and cool" alert once temp is completely decreased.
    // lazyLink so that we do not hear the alert on startup
    // exists for the lifetime of the sim, no need to dispose
    model.vibrationAmplitudeProperty.lazyLink( amplitude => {
      if ( amplitudeIncreasedEnoughForSettledAndCoolAlert && amplitude === model.vibrationAmplitudeProperty.initialValue ) {
        alertSettledAndCool();
        amplitudeIncreasedEnoughForSettledAndCoolAlert = false;
      }

      // The amplitude must increase 1% of its range before the next settled and cool alert can be triggered.
      if ( amplitude >= model.vibrationAmplitudeProperty.range.expandNormalizedValue( 0.01 ) ) {
        amplitudeIncreasedEnoughForSettledAndCoolAlert = true;
      }
    } );

    // pdom
    const frictionScreenSummaryNode = new FrictionScreenSummaryNode( model, THERMOMETER_MIN_TEMP, THERMOMETER_MAX_TEMP,
      temperatureDecreasingAlerter );
    screenSummaryNodeContainer.addChild( frictionScreenSummaryNode );

    // @private
    this.frictionScreenSummaryNode = frictionScreenSummaryNode;

    // add physics book
    this.addChild( new BookNode( model, physicsString, temperatureIncreasingAlerter, temperatureDecreasingAlerter,
      bookMovementAlerter, grabbedDescriber, alertSettledAndCool, tandem.createTandem( 'bottomBookNode' ), {
        x: 50,
        y: 225
      } ) );

    // add chemistry book
    const chemistryBookNode = new BookNode( model, chemistryString, temperatureIncreasingAlerter,
      temperatureDecreasingAlerter,
      bookMovementAlerter, grabbedDescriber, alertSettledAndCool, tandem.createTandem( 'topBookNode' ), {
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
    this.magnifierNode = new MagnifierNode( model, 195, 425, chemistryString, temperatureIncreasingAlerter,
      temperatureDecreasingAlerter,
      bookMovementAlerter, grabbedDescriber, alertSettledAndCool, {
        x: 40,
        y: 25,
        layerSplit: true,

        tandem: tandem.createTandem( 'atomicView' )
      } );
    this.addChild( this.magnifierNode );

    // add thermometer
    this.addChild( new ThermometerNode(
      THERMOMETER_MIN_TEMP,
      THERMOMETER_MAX_TEMP,
      model.vibrationAmplitudeProperty, {
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
        model.reset();
        this.reset();
      },
      radius: 22,
      x: model.width * 0.94,
      y: model.height * 0.9,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // create and register the sound that will be played to indicate changes to the rate of molecule motion
    soundManager.addSoundGenerator( new MoleculeMotionSoundGenerator( model.vibrationAmplitudeProperty, {
      initialOutputLevel: 0,
      maxOutputLevel: 0.175
    } ) );

    // create and hook up the sound that is played when molecules break off from the top book
    const moleculeBreakOffSoundClip = new SoundClip( moleculeBreakOffSound, {
      initialOutputLevel: 0.05,
      rateChangesAffectPlayingSounds: false
    } );
    soundManager.addSoundGenerator( moleculeBreakOffSoundClip );
    model.evaporationEmitter.addListener( () => {

      // don't play for every evaporated molecule or it's too noisy
      if ( model.numberOfAtomsEvaporated % 4 === 0 ) {

        // set a random playback rate
        moleculeBreakOffSoundClip.setPlaybackRate( FrictionConstants.GET_RANDOM_PENTATONIC_PLAYBACK_RATE(), 0 );

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
      temperatureDecreasingAlerter.reset();
      temperatureIncreasingAlerter.reset();
      breakAwayAlerter.reset();
      bookMovementAlerter.reset();
      frictionScreenSummaryNode.updateSummaryString();
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
   * To support voicing.
   * @override
   * @public
   */
  getVoicingOverviewContent() {
    return frictionStrings.a11y.readMeOverview;
  }

  /**
   * To support voicing.
   * @override
   * @public
   */
  getVoicingDetailsContent() {
    return this.frictionScreenSummaryNode.getCurrentDetailsString();
  }

  /**
   * To support voicing.
   * @override
   * @public
   */
  getVoicingHintContent() {
    return this.frictionScreenSummaryNode.getHintString();
  }
}

friction.register( 'FrictionScreenView', FrictionScreenView );
export default FrictionScreenView;