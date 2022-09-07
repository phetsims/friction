// Copyright 2021-2022, University of Colorado Boulder

/**
 * Alerts related to grabbing the book
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import friction from '../../friction.js';
import FrictionStrings from '../../FrictionStrings.js';

// constants
const grabbedString = StringUtils.fillIn( FrictionStrings.a11y.grabbedPattern, {
  alert: ''
} );
const grabbedLightlyOnBook = StringUtils.fillIn( FrictionStrings.a11y.grabbedPattern, {
  alert: FrictionStrings.a11y.lightlyOnPhysicsBook
} );
const grabbedTouchingString = StringUtils.fillIn( FrictionStrings.a11y.grabbedPattern, {
  alert: FrictionStrings.a11y.rubFastOrSlow
} );
const grabbedNotTouchingString = StringUtils.fillIn( FrictionStrings.a11y.grabbedNotTouchingPattern, {
  grabbedOnBook: grabbedLightlyOnBook,
  moveDownToRubHarder: FrictionStrings.a11y.moveDownToRubHarder
} );

/**
 * @param {Object} [options]
 * @constructor
 */
class GrabbedDescriber {

  /**
   * @param {BooleanProperty} contactProperty
   * @param {BooleanProperty} successfullyInteractedWithProperty
   */
  constructor( contactProperty, successfullyInteractedWithProperty ) {

    // we do not have access to phet.joist.sim until the sim starts, so these can't be constants
    const initialGrabbedNotTouchingString = phet.joist.sim.supportsGestureDescription ?
                                            FrictionStrings.a11y.initialTouchGrabbedNotTouching :
                                            FrictionStrings.a11y.initialKeyboardGrabbedNotTouching;

    const initialGrabbedTouchingString = phet.joist.sim.supportsGestureDescription ?
                                         FrictionStrings.a11y.initialTouchGrabbedTouching :
                                         FrictionStrings.a11y.initialKeyboardGrabbedTouching;

    this.touchingAlerts = { initial: initialGrabbedTouchingString, subsequent: grabbedTouchingString };
    this.notTouchingAlerts = { initial: initialGrabbedNotTouchingString, subsequent: grabbedLightlyOnBook };

    // @private
    this.contactProperty = contactProperty;
    this.successfullyInteractedWithProperty = successfullyInteractedWithProperty;
  }

  /**
   * for pdom
   * @public
   * @returns {string}
   */
  getGrabbedString() {

    const alerts = this.contactProperty.get() ? this.touchingAlerts : this.notTouchingAlerts;

    let alert = alerts.initial;
    if ( this.successfullyInteractedWithProperty.value ) {
      alert = alerts.subsequent;
    }
    return alert;
  }

  /**
   * Different string for Voicing
   * @public
   * @returns {string}
   */
  getGrabbedVoicingString() {

    // self-voicing alerts - all self-voicing alerts exclude the "WASD" keyboard information
    return this.contactProperty.get() ? this.touchingAlerts.subsequent : grabbedNotTouchingString;
  }

  /**
   * @public
   * @returns {string}
   */
  getVoicingGrabbedObjectResponse() {
    return this.contactProperty.get() ? grabbedString : grabbedLightlyOnBook;
  }
}

friction.register( 'GrabbedDescriber', GrabbedDescriber );
export default GrabbedDescriber;