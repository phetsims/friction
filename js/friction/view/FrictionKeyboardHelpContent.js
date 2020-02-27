// Copyright 2017-2020, University of Colorado Boulder

/**
 * Content for the "Hot Keys and Help" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import GeneralKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/GeneralKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import frictionStrings from '../../friction-strings.js';
import friction from '../../friction.js';
import FrictionA11yStrings from '../FrictionA11yStrings.js';

const bookLabelString = frictionStrings.bookLabel;
const bookTitleString = frictionStrings.bookTitle;
const moveBookHeaderString = frictionStrings.moveBookHeader;
const moveBookString = frictionStrings.moveBook;
const moveInSmallerStepsString = frictionStrings.moveInSmallerSteps;

// a11y strings
const moveBookWithString = FrictionA11yStrings.moveBookWith.value;
const moveInSmallerStepsWithString = FrictionA11yStrings.moveInSmallerStepsWith.value;

class FrictionKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {

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
    options = merge( {

      // icon options
      arrowKeysScale: 0.55
    }, options );

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