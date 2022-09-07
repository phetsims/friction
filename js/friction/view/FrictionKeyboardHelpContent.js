// Copyright 2017-2022, University of Colorado Boulder

/**
 * Content for the "Keyboard Shortcuts" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import friction from '../../friction.js';
import FrictionStrings from '../../FrictionStrings.js';

// constants
const bookLabelString = FrictionStrings.bookLabel;
const bookTitleString = FrictionStrings.bookTitle;
const moveBookHeaderString = FrictionStrings.moveBookHeader;
const moveBookString = FrictionStrings.moveBook;
const moveInSmallerStepsString = FrictionStrings.moveInSmallerSteps;

const moveBookWithString = FrictionStrings.a11y.moveBookWith;
const moveInSmallerStepsWithString = FrictionStrings.a11y.moveInSmallerStepsWith;

class FrictionKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {

    // make all the KeyboardHelpSection consistent in layout
    const maxWidth = 175;
    const grabReleaseHelpSection = KeyboardHelpSection.getGrabReleaseHelpSection( bookTitleString, bookLabelString, {
      textMaxWidth: maxWidth
    } );
    const moveBookHelpSection = new MoveBookHelpSection( {
      textMaxWidth: maxWidth
    } );
    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection();

    KeyboardHelpSection.alignHelpSectionIcons( [ grabReleaseHelpSection, moveBookHelpSection ] );

    const leftContent = [ grabReleaseHelpSection, moveBookHelpSection ];
    const rightContent = [ basicActionsHelpSection ];
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
    const moveBookRow = KeyboardHelpSectionRow.labelWithIcon( moveBookString, moveBookIcon, {
      labelInnerContent: moveBookWithString
    } );

    // BookNode in smaller steps row
    const shiftPlusArrowKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.arrowKeysRowIcon() );
    const shiftPlusWASDKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.wasdRowIcon() );
    const row = KeyboardHelpSectionRow.labelWithIconList( moveInSmallerStepsString, [ shiftPlusArrowKeys, shiftPlusWASDKeys ], {
      labelInnerContent: moveInSmallerStepsWithString
    } );

    super( moveBookHeaderString, [ moveBookRow, row ], options );
  }
}

export default FrictionKeyboardHelpContent;