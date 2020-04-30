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
import inherit from '../../../../phet-core/js/inherit.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import moleculeBreakOffSound from '../../../sounds/break-off-autosinfonie-spatialized_mp3.js';
import bookContactSound from '../../../sounds/contact-lower_mp3.js';
import frictionStrings from '../../frictionStrings.js';
import friction from '../../friction.js';
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
import MoleculeMotionSoundGenerator from './MoleculeMotionSoundGenerator.js';

// constants
const chemistryString = frictionStrings.chemistry;
const physicsString = frictionStrings.physics;

const THERMOMETER_FLUID_MAIN_COLOR = 'rgb(237,28,36)';
const THERMOMETER_FLUID_HIGHLIGHT_COLOR = 'rgb(240,150,150)';
const THERMOMETER_FLUID_RIGHT_SIDE_COLOR = 'rgb(237,28,36)';
const THERMOMETER_BACKGROUND_FILL_COLOR = 'white';
const THERMOMETER_MIN_TEMP = FrictionModel.THERMOMETER_MIN_TEMP;
const THERMOMETER_MAX_TEMP = FrictionModel.THERMOMETER_MAX_TEMP;

/**
 * @param {FrictionModel} model
 * @param {Tandem} tandem
 * @constructor
 */
function FrictionScreenView( model, tandem ) {
  const self = this;

  // pdom - initialize the describers for auditory descriptions and alerts.
  const temperatureIncreasingDescriber = new TemperatureIncreasingDescriber( model );
  const temperatureDecreasingDescriber = new TemperatureDecreasingDescriber( model );
  const breakAwayDescriber = new BreakAwayDescriber( model );
  const bookMovementDescriber = new BookMovementDescriber( model );

  // pdom
  const frictionScreenSummaryNode = new FrictionScreenSummaryNode( model, THERMOMETER_MIN_TEMP, THERMOMETER_MAX_TEMP,
    temperatureDecreasingDescriber );

  ScreenView.call( this, {
    layoutBounds: new Bounds2( 0, 0, model.width, model.height ),
    screenSummaryContent: frictionScreenSummaryNode
  } );

  // @private
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
  this.pdomPlayAreaNode.accessibleOrder = [ chemistryBookNode, this.magnifierNode ];

  // add reset button
  const resetAllButton = new ResetAllButton( {
    listener: function() {
      model.reset();
      self.reset();
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
  this.pdomControlAreaNode.accessibleOrder = [ resetAllButton ];

  // @private
  this.resetFrictionScreenView = function() {

    // pdom - among other things, this will reset the grab button cuing.
    this.magnifierNode.reset();
    chemistryBookNode.reset();

    // pdom, reset PDOM and reset alerting types
    temperatureDecreasingDescriber.reset();
    temperatureIncreasingDescriber.reset();
    breakAwayDescriber.reset();
    bookMovementDescriber.reset();
    frictionScreenSummaryNode.updateSummaryString();
  };
}

friction.register( 'FrictionScreenView', FrictionScreenView );

inherit( ScreenView, FrictionScreenView, {

  /**
   * move forward in time
   * @param {number} dt - delta time, in seconds
   * @public
   */
  step( dt ) {
    this.magnifierNode.step( dt );
    this.bookRubSoundGenerator.step( dt );
    this.coolingSoundGenerator.step( dt );
  },

  /**
   * Reset the view
   * @private
   */
  reset() {
    this.resetFrictionScreenView();
  }
} );

export default FrictionScreenView;