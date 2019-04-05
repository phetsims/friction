// Copyright 2017-2019, University of Colorado Boulder

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
  const GeneralKeyboardHelpSection = require( 'SCENERY_PHET/keyboard/help/GeneralKeyboardHelpSection' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const KeyboardHelpSection = require( 'SCENERY_PHET/keyboard/help/KeyboardHelpSection' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const bookLabelString = require( 'string!FRICTION/bookLabel' );
  const bookTitleString = require( 'string!FRICTION/bookTitle' );
  const moveBookHeaderString = require( 'string!FRICTION/moveBookHeader' );
  const moveBookString = require( 'string!FRICTION/moveBook' );
  const moveInSmallerStepsString = require( 'string!FRICTION/moveInSmallerSteps' );

  // a11y strings
  const moveBookWithString = FrictionA11yStrings.moveBookWith.value;
  const moveInSmallerStepsWithString = FrictionA11yStrings.moveInSmallerStepsWith.value;

  /**
   * @constructor
   */
  function FrictionKeyboardHelpContent() {

    // make all the KeyboardHelpSection consistent in layout
    const maxWidth = 130;
    const grabReleaseHelpSection = KeyboardHelpSection.getGrabReleaseHelpSection( bookTitleString, bookLabelString, {
      labelMaxWidth: maxWidth
    } );
    const moveBookHelpSection = new MoveBookHelpSection( {
      labelMaxWidth: maxWidth

    } );
    const generalNavigationHelpSection = new GeneralKeyboardHelpSection( {
      labelMaxWidth: maxWidth

    } );

    KeyboardHelpSection.alignHelpSectionIcons( [ grabReleaseHelpSection, moveBookHelpSection ] );

    HBox.call( this, {
      children: [
        new VBox( { children: [ grabReleaseHelpSection, moveBookHelpSection ], spacing: 10, align: 'left' } ),
        generalNavigationHelpSection
      ],
      align: 'top',
      spacing: 30
    } );
  }

  /**
   * @param {Object} [options]
   * @constructor
   */
  function MoveBookHelpSection( options ) {

    Node.call( this );
    options = _.extend( {

      // icon options
      arrowKeysScale: 0.55
    }, options );

    // BookNode row
    const moveBookIcon = KeyboardHelpSection.arrowOrWasdKeysRowIcon();
    const moveBookRow = KeyboardHelpSection.labelWithIcon( moveBookString, moveBookIcon, moveBookWithString );

    // BookNode in smaller steps row
    const shiftPlusArrowKeys = KeyboardHelpSection.shiftPlusIcon( KeyboardHelpSection.arrowKeysRowIcon() );
    const shiftPlusWASDKeys = KeyboardHelpSection.shiftPlusIcon( KeyboardHelpSection.wasdRowIcon() );
    const row = KeyboardHelpSection.labelWithIconList( moveInSmallerStepsString, [ shiftPlusArrowKeys, shiftPlusWASDKeys ], moveInSmallerStepsWithString );

    KeyboardHelpSection.call( this, moveBookHeaderString, [ moveBookRow, row ], options );
  }

  inherit( KeyboardHelpSection, MoveBookHelpSection );

  friction.register( 'FrictionKeyboardHelpContent', FrictionKeyboardHelpContent );

  return inherit( HBox, FrictionKeyboardHelpContent );
} );