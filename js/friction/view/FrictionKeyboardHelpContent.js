// Copyright 2017, University of Colorado Boulder

/**
 * Content for the "Hot Keys and Help" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var friction = require( 'FRICTION/friction' );
  var GeneralNavigationHelpContent = require( 'SCENERY_PHET/keyboard/help/GeneralNavigationHelpContent' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HelpContent = require( 'SCENERY_PHET/keyboard/help/HelpContent' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var RichText = require( 'SCENERY/nodes/RichText' );

  // TODO: export to string files
  var moveBookHeaderString = 'Move Book';
  var moveBookString = 'Move book';
  var moveInSmallerSteps = 'Move in smaller steps';

  var DEFAULT_LABEL_OPTIONS = {
    font: HelpContent.DEFAULT_LABEL_FONT,
    maxWidth: HelpContent.DEFAULT_TEXT_MAX_WIDTH
  };

  /**
   * Constructor.
   *
   * @constructor
   */
  function FrictionKeyboardHelpContent() {

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
   *
   * @param options
   * @constructor
   */
  function MoveBookHelpNode( options ) {

    Node.call( this );
    options = _.extend( {
      // icon options
      arrowKeysScale: 0.55,
      verticalIconSpacing: HelpContent.DEFAULT_VERTICAL_ICON_SPACING

    }, options );

    // Book row
    var moveBookText = new RichText( moveBookString, DEFAULT_LABEL_OPTIONS );
    var moveBookIcon = HelpContent.arrowOrWasdKeysRowIcon();
    var moveBookRow = HelpContent.labelWithIcon( moveBookText, moveBookIcon );

    // Book in smaller steps row
    var moveInSmallerStepsText = new RichText( moveInSmallerSteps, DEFAULT_LABEL_OPTIONS );
    var shiftPlusArrowKeys = HelpContent.shiftPlusIcon( HelpContent.arrowKeysRowIcon() );
    var shiftPlusWASDKeys = HelpContent.shiftPlusIcon( HelpContent.wasdRowIcon() );
    var row = HelpContent.labelWithIconList( moveInSmallerStepsText, [ shiftPlusArrowKeys, shiftPlusWASDKeys ], {
      spacing: HelpContent.DEFAULT_LABEL_ICON_SPACING
    } );

    HelpContent.call( this, moveBookHeaderString, [ moveBookRow, row ], options );
  }

  inherit( HelpContent, MoveBookHelpNode );

  friction.register( 'FrictionKeyboardHelpContent', FrictionKeyboardHelpContent );

  return inherit( Panel, FrictionKeyboardHelpContent );
} );