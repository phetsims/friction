// Copyright 2017-2021, University of Colorado Boulder

/**
 * Content for the "Keyboard Shortcuts" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import GeneralKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/GeneralKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import friction from '../../friction.js';
import frictionStrings from '../../frictionStrings.js';

// constants
const bookLabelString = frictionStrings.bookLabel;
const bookTitleString = frictionStrings.bookTitle;
const moveBookHeaderString = frictionStrings.moveBookHeader;
const moveBookString = frictionStrings.moveBook;
const moveInSmallerStepsString = frictionStrings.moveInSmallerSteps;

const moveBookWithString = frictionStrings.a11y.moveBookWith;
const moveInSmallerStepsWithString = frictionStrings.a11y.moveInSmallerStepsWith;

class FrictionKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {

    // make all the KeyboardHelpSection consistent in layout
    const maxWidth = 175;
    const grabReleaseHelpSection = KeyboardHelpSection.getGrabReleaseHelpSection( bookTitleString, bookLabelString, {
      labelMaxWidth: maxWidth
    } );
    const moveBookHelpSection = new MoveBookHelpSection( {
      labelMaxWidth: maxWidth
    } );
    const generalNavigationHelpSection = new GeneralKeyboardHelpSection();

    KeyboardHelpSection.alignHelpSectionIcons( [ grabReleaseHelpSection, moveBookHelpSection ] );

    const leftContent = [ grabReleaseHelpSection, moveBookHelpSection ];
    const rightContent = [ generalNavigationHelpSection ];
    super( leftContent, rightContent, {
      sectionSpacing: 10
    } );
  }
}

friction.register( 'FrictionKeyboardHelpContent', FrictionKeyboardHelpContent );

/**
 * @param {Object} [options]
 * @constructor
 */
class MoveBookHelpSection extends KeyboardHelpSection {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    // BookNode row
    const moveBookIcon = KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon();
    const moveBookRow = KeyboardHelpSection.labelWithIcon( moveBookString, moveBookIcon, moveBookWithString );

    // BookNode in smaller steps row
    const shiftPlusArrowKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.arrowKeysRowIcon() );
    const shiftPlusWASDKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.wasdRowIcon() );
    const row = KeyboardHelpSection.labelWithIconList( moveInSmallerStepsString, [ shiftPlusArrowKeys, shiftPlusWASDKeys ], moveInSmallerStepsWithString );

    super( moveBookHeaderString, [ moveBookRow, row ], options );
  }
}

export default FrictionKeyboardHelpContent;