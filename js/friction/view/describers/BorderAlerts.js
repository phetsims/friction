// Copyright 2018, University of Colorado Boulder

/**
 TODO
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( ( require ) => {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const Util = require( 'DOT/Util' );

  /**
   * Responsible for alerting when the temperature increases
   * @param {Object} [options]
   * @constructor
   */
  class BorderAlerts {
    constructor( options ) {

      options = _.extend( {

        // {string|null|Array.<string>} left, right, top, with values to alert if you reach that bound null if you don't want it alerted.
        // If an array of string, each alert in the array will be read each new time that alert occurs. The last alert in
        // the list will be read out each subsequent time if the alert occurs more than the number of items in the list.
        leftAlert: 'At left edge',
        rightAlert: 'At right edge',
        topAlert: 'At top',
        bottomAlert: 'At bottom'

      }, options );

      // @public
      this.left = new BorderAlert( options.leftAlert );
      this.right = new BorderAlert( options.rightAlert );
      this.top = new BorderAlert( options.topAlert );
      this.bottom = new BorderAlert( options.bottomAlert );
      this.permittedBorders = [ 'left', 'right', 'top', 'bottom' ];
    }

    /**
     * A borderAlertObject is defined in the constructor, and has two properties: "alert" and "numberOfTimesALerted"
     * The goal of this function is to get the appropriate alert from that object given the number
     * of times it has been alerted.
     * @param {string} whichBorder - the key cooresponding to which border alert needs to be retrieved
     * @returns {string|null|Array.<string>} - see BorderAlert
     */
    getAlert( whichBorder ) {
      assert && assert( this.permittedBorders.indexOf( whichBorder ) >= 1 );

      var borderAlert = this[ whichBorder ];
      assert && assert( borderAlert instanceof BorderAlert, 'sanity check' );
      return borderAlert.getAlert;
    }


    /**
     * @public
     */
    reset() {
      this.left.reset();
      this.right.reset();
      this.top.reset();
      this.bottom.reset();
    }
  }


  /**
   * Data structure type that holds structure about a single alert that happens at the border of a describer.
   */
  class BorderAlert {
    constructor( alert ) {
      assert && assert( Array.isArray( alert ) || alert === null || typeof alert === 'string' );

      // @private
      this._alert = alert; // {string|null|Array.<string>}

      // {number} - the number of times that alert has been alerted. It is assumed that every time you get an alert this is incremented
      this._numberOfTimesAlerted = 0;
      this._lastAlerted = null; // {null|number}
    }

    /**
     * Manages all the different supported types of alert and will get the appropriate alert
     * @public
     * @returns {string}
     */
    get getAlert() {
      if ( Array.isArray( this._alert ) ) {
        let index = Util.clamp( this._numberOfTimesAlerted, 0, this._alert.length - 1 );
        this._numberOfTimesAlerted++;
        return this._alert[ index ];
      }
      this._numberOfTimesAlerted++;
      return this._alert;
    }

    /**
     * @public
     * @returns {number}
     */
    get numberOfTimesAlerted() { return this._numberOfTimesAlerted; }

    /**
     * @public
     * @param numberOfTimesAlerted
     */
    set numberOfTimesAlerted( numberOfTimesAlerted ) { this._numberOfTimesAlerted = numberOfTimesAlerted; }

    /**
     * @public
     * @returns {null|number}
     */
    get lastAlerted() { return this._lastAlerted; }

    /**
     * @public
     * @param {null|number} lastAlerted
     */
    set lastAlerted( lastAlerted ) { this._lastAlerted = lastAlerted; }

    /**
     * @public
     */
    reset() {
      this._numberOfTimesAlerted = 0;
      this._lastAlerted = null;
    }
  }

  friction.register( 'BorderAlert', BorderAlert );

  return friction.register( 'BorderAlerts', BorderAlerts );

} );