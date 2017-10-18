// Copyright 2017, University of Colorado Boulder

/**
 * Content for the "Hot Keys and Help" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var friction = require( 'FRICTION/friction' );
  var Panel = require( 'SUN/Panel' );
  var GeneralNavigationHelpContent = require( 'SCENERY_PHET/keyboard/help/GeneralNavigationHelpContent' );

  /**
   * Constructor.
   *
   * @constructor
   */
  function FrictionKeyboardHelpContent( ) {

    var generalNavigationHelpContent = new GeneralNavigationHelpContent( );

    var content = new HBox( {
      children: [ generalNavigationHelpContent ],
      align: 'top',
      spacing: 30
    } );

    Panel.call( this, content, {
      stroke: null,
      fill: 'rgb( 214, 237, 249 )'
    } );
  }

  friction.register( 'FrictionKeyboardHelpContent', FrictionKeyboardHelpContent );

  return inherit( Panel, FrictionKeyboardHelpContent );
} );