// Copyright 2017-2023, University of Colorado Boulder

/**
 * Content for the "Keyboard Shortcuts" dialog that can be brought up from the sim navigation bar.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import GrabReleaseKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/GrabReleaseKeyboardHelpSection.js';
import KeyboardHelpIconFactory from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpIconFactory.js';
import KeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSection.js';
import KeyboardHelpSectionRow from '../../../../scenery-phet/js/keyboard/help/KeyboardHelpSectionRow.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';
import friction from '../../friction.js';
import FrictionStrings from '../../FrictionStrings.js';

class FrictionKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  constructor() {

    // make all the KeyboardHelpSection consistent in layout
    const maxWidth = 175;
    const grabReleaseHelpSection = new GrabReleaseKeyboardHelpSection(
      FrictionStrings.bookTitleStringProperty,
      FrictionStrings.bookLabelStringProperty, {
        textMaxWidth: maxWidth
      } );
    const moveBookHelpSection = new MoveBookHelpSection( {
      textMaxWidth: maxWidth
    } );
    const basicActionsHelpSection = new BasicActionsKeyboardHelpSection();

    KeyboardHelpSection.alignHelpSectionIcons( [ grabReleaseHelpSection, moveBookHelpSection ] );

    const leftContent = [ grabReleaseHelpSection, moveBookHelpSection ];
    const rightContent = [ basicActionsHelpSection ];
    super( leftContent, rightContent, { sectionSpacing: 10 } );

    this.disposeFrictionKeyboardHelpContent = () => {
      grabReleaseHelpSection.dispose();
      moveBookHelpSection.dispose();
      basicActionsHelpSection.dispose();
    };
  }

  // @public
  dispose() {
    this.disposeFrictionKeyboardHelpContent();
    super.dispose();
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
    const moveBookRow = KeyboardHelpSectionRow.labelWithIcon( FrictionStrings.moveBookStringProperty, moveBookIcon, {
      labelInnerContent: FrictionStrings.a11y.moveBookWithStringProperty
    } );

    // BookNode in smaller steps row
    const shiftPlusArrowKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.arrowKeysRowIcon() );
    const shiftPlusWASDKeys = KeyboardHelpIconFactory.shiftPlusIcon( KeyboardHelpIconFactory.wasdRowIcon() );
    const moveInSmallerStepsRow = KeyboardHelpSectionRow.labelWithIconList( FrictionStrings.moveInSmallerStepsStringProperty, [
      shiftPlusArrowKeys, shiftPlusWASDKeys
    ], {
      labelInnerContent: FrictionStrings.a11y.moveInSmallerStepsWithStringProperty
    } );

    super( FrictionStrings.moveBookHeaderStringProperty, [ moveBookRow, moveInSmallerStepsRow ], options );

    // @private
    this.disposeMoveBookHelpSection = () => {
      moveBookRow.dispose();
      moveInSmallerStepsRow.dispose();
      moveBookIcon.dispose();
      shiftPlusArrowKeys.dispose();
      shiftPlusWASDKeys.dispose();
    };
  }

  // @public
  dispose() {
    this.disposeMoveBookHelpSection();
    super.dispose();
  }
}

export default FrictionKeyboardHelpContent;