// Copyright 2021, University of Colorado Boulder

/**
 * Alerts related to grabbing the book
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import friction from '../../../friction.js';
import frictionStrings from '../../../frictionStrings.js';

// constants
const initialGrabbedNotTouchingString = frictionStrings.a11y.initialGrabbedNotTouching;
const grabbedNotTouchingString = StringUtils.fillIn( frictionStrings.a11y.grabbedNotTouchingPattern, {
  grabbedOnBook: StringUtils.fillIn( frictionStrings.a11y.grabbedPattern, {
    alert: frictionStrings.a11y.lightlyOnPhysicsBook
  } ),
  moveDownToRubHarder: frictionStrings.a11y.moveDownToRubHarder
} );
const initialGrabbedTouchingString = frictionStrings.a11y.initialGrabbedTouching;
const grabbedTouchingString = StringUtils.fillIn( frictionStrings.a11y.grabbedPattern, {
  alert: frictionStrings.a11y.rubFastOrSlow
} );

const touchingAlerts = { initial: initialGrabbedTouchingString, subsequent: grabbedTouchingString };
const notTouchingAlerts = { initial: initialGrabbedNotTouchingString, subsequent: grabbedNotTouchingString };

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

    // @private
    this.contactProperty = contactProperty;
    this.successfullyInteractedWithProperty = successfullyInteractedWithProperty;
  }

  /**
   * @public
   * @returns {string}
   */
  getGrabbedString() {

    const alerts = this.contactProperty.get() ? touchingAlerts : notTouchingAlerts;

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
    const alerts = this.contactProperty.get() ? touchingAlerts : notTouchingAlerts;

    // self-voicing alerts - all self-voicing alerts exclude the "WASD" keyboard information
    return alerts.subsequent;
  }

  /**
   * @public
   * @returns {string}
   */
  getVoicingGrabbedObjectResponse() {

    // TODO: what is the object response when contacted? https://github.com/phetsims/friction/issues/203
    return this.contactProperty.get() ? 'I do not know this one ' : frictionStrings.a11y.lightlyOnPhysicsBook;
  }

  /**
   * @public
   * @returns {string}
   */
  getVoicingGrabbedHintResponse() {
    return this.contactProperty.get() ? frictionStrings.a11y.rubFastOrSlow : frictionStrings.a11y.moveDownToRubHarder;
  }
}

friction.register( 'GrabbedDescriber', GrabbedDescriber );
export default GrabbedDescriber;