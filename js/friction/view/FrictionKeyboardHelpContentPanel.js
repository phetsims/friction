// Copyright 2017-2018, University of Colorado Boulder

/**
 * Content for the "Hot Keys and Help" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );
  var FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  var GeneralNavigationHelpContent = require( 'SCENERY_PHET/keyboard/help/GeneralNavigationHelpContent' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HelpContent = require( 'SCENERY_PHET/keyboard/help/HelpContent' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var RichText = require( 'SCENERY/nodes/RichText' );

  // strings
  var moveBookHeaderString = require( 'string!FRICTION/moveBookHeader' );
  var moveBookString = require( 'string!FRICTION/moveBook' );
  var moveInSmallerStepsString = require( 'string!FRICTION/moveInSmallerSteps' );

  // a11y strings
  var moveBookWithString = FrictionA11yStrings.moveBookWith.value;
  var moveSlowerWithString = FrictionA11yStrings.moveSlowerWith.value;

  // constants
  var DEFAULT_LABEL_OPTIONS = {
    font: HelpContent.DEFAULT_LABEL_FONT,
    maxWidth: HelpContent.DEFAULT_TEXT_MAX_WIDTH
  };

  /**
   * @constructor
   */
  function FrictionKeyboardHelpContentPanel() {

    var moveBookHelpContent = new MoveBookHelpNode();
    var generalNavigationHelpContent = new GeneralNavigationHelpContent();

    var content = new HBox( {
      children: [ moveBookHelpContent, generalNavigationHelpContent ],
      align: 'top',
      spacing: 30
    } );

    Panel.call( this, content, {
      stroke: null,
      fill: 'rgb( 214, 237, 249 )'
    } );
  }

  /**
   * @param {Object} [options]
   * @constructor
   */
  function MoveBookHelpNode( options ) {

    Node.call( this );
    options = _.extend( {

      // icon options
      arrowKeysScale: 0.55,
      verticalIconSpacing: HelpContent.DEFAULT_VERTICAL_ICON_SPACING

    }, options );

    // BookNode row
    var moveBookText = new RichText( moveBookString, DEFAULT_LABEL_OPTIONS );
    var moveBookIcon = HelpContent.arrowOrWasdKeysRowIcon();
    var moveBookRow = HelpContent.labelWithIcon( moveBookText, moveBookIcon, moveBookWithString );

    // BookNode in smaller steps row
    var moveInSmallerStepsText = new RichText( moveInSmallerStepsString, DEFAULT_LABEL_OPTIONS );
    var shiftPlusArrowKeys = HelpContent.shiftPlusIcon( HelpContent.arrowKeysRowIcon() );
    var shiftPlusWASDKeys = HelpContent.shiftPlusIcon( HelpContent.wasdRowIcon() );
    var row = HelpContent.labelWithIconList( moveInSmallerStepsText, [ shiftPlusArrowKeys, shiftPlusWASDKeys ], moveSlowerWithString );

    HelpContent.call( this, moveBookHeaderString, [ moveBookRow, row ], options );
  }

  inherit( HelpContent, MoveBookHelpNode );

  friction.register( 'FrictionKeyboardHelpContentPanel', FrictionKeyboardHelpContentPanel );

  return inherit( Panel, FrictionKeyboardHelpContentPanel );
} );