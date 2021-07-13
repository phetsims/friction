// Copyright 2021, University of Colorado Boulder

/**
 * Alerts related to grabbing the book
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import friction from '../../../friction.js';
import frictionStrings from '../../../frictionStrings.js';

// constants
const initialGrabbedNotTouchingString = frictionStrings.a11y.initialGrabbedNotTouching;
const grabbedNotTouchingString = frictionStrings.a11y.grabbedNotTouching;
const initialGrabbedTouchingString = frictionStrings.a11y.initialGrabbedTouching;
const grabbedTouchingString = frictionStrings.a11y.grabbedTouching;

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
}

friction.register( 'GrabbedDescriber', GrabbedDescriber );
export default GrabbedDescriber;