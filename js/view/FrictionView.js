// Copyright 2002-2013, University of Colorado Boulder

/**
 * main ScreenView container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

define( function( require ) {
  'use strict';
  var ScreenView = require( 'JOIST/ScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );

  function GravityAndOrbitsView( model ) {
    ScreenView.call( this, { renderer: 'svg' } );
  }

  inherit( ScreenView, GravityAndOrbitsView );

  return GravityAndOrbitsView;
} );