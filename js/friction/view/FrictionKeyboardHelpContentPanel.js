// Copyright 2017-2018, University of Colorado Boulder

/**
 * Content for the "Hot Keys and Help" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const GeneralNavigationHelpContent = require( 'SCENERY_PHET/keyboard/help/GeneralNavigationHelpContent' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HelpContent = require( 'SCENERY_PHET/keyboard/help/HelpContent' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const moveBookHeaderString = require( 'string!FRICTION/moveBookHeader' );
  const bookTitleString = require( 'string!FRICTION/bookTitle' );
  const bookLabelString = require( 'string!FRICTION/bookLabel' );
  const moveBookString = require( 'string!FRICTION/moveBook' );
  const moveInSmallerStepsString = require( 'string!FRICTION/moveInSmallerSteps' );

  // a11y strings
  let moveBookWithString = FrictionA11yStrings.moveBookWith.value;
  let moveInSmallerStepsWithString = FrictionA11yStrings.moveInSmallerStepsWith.value;

  // constants
  let DEFAULT_LABEL_OPTIONS = {
    font: HelpContent.DEFAULT_LABEL_FONT,
    maxWidth: HelpContent.DEFAULT_TEXT_MAX_WIDTH
  };

  /**
   * @constructor
   */
  function FrictionKeyboardHelpContentPanel() {

    let grabReleaseHelpContent = HelpContent.getGrabReleaseHelpContent( bookTitleString, bookLabelString );
    let moveBookHelpContent = new MoveBookHelpNode();
    let generalNavigationHelpContent = new GeneralNavigationHelpContent();

    let content = new HBox( {
      children: [
        // TODO: manage spacing
        new VBox( { children: [ grabReleaseHelpContent, moveBookHelpContent ], spacing: 10 } ),
        generalNavigationHelpContent
      ],
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
    let moveBookText = new RichText( moveBookString, DEFAULT_LABEL_OPTIONS );
    let moveBookIcon = HelpContent.arrowOrWasdKeysRowIcon();
    let moveBookRow = HelpContent.labelWithIcon( moveBookText, moveBookIcon, moveBookWithString );

    // BookNode in smaller steps row
    let moveInSmallerStepsText = new RichText( moveInSmallerStepsString, DEFAULT_LABEL_OPTIONS );
    let shiftPlusArrowKeys = HelpContent.shiftPlusIcon( HelpContent.arrowKeysRowIcon() );
    let shiftPlusWASDKeys = HelpContent.shiftPlusIcon( HelpContent.wasdRowIcon() );
    let row = HelpContent.labelWithIconList( moveInSmallerStepsText, [ shiftPlusArrowKeys, shiftPlusWASDKeys ], moveInSmallerStepsWithString );

    HelpContent.call( this, moveBookHeaderString, [ moveBookRow, row ], options );
  }

  inherit( HelpContent, MoveBookHelpNode );

  friction.register( 'FrictionKeyboardHelpContentPanel', FrictionKeyboardHelpContentPanel );

  return inherit( Panel, FrictionKeyboardHelpContentPanel );
} );