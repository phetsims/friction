// Copyright 2018, University of Colorado Boulder

/**
 * Listener for the book and magnifier areas.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const inherit = require( 'PHET_CORE/inherit' );
  const SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  const Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {FrictionModel} model
   * @param {Tandem} tandem
   * @constructor
   */
  function FrictionDragHandler( model, tandem ) {
    SimpleDragHandler.call( this, {
      translate: function( e ) {
        model.move( new Vector2( e.delta.x, e.delta.y ) );
      },
      end: function() {
        model.bottomOffsetProperty.set( 0 );
      },
      tandem: tandem
    } );
  }

  friction.register( 'FrictionDragHandler', FrictionDragHandler );

  return inherit( SimpleDragHandler, FrictionDragHandler );
} );