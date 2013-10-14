// Copyright 2002-2013, University of Colorado Boulder

/**
 * main Model container.
 *
 * @author Andrey Zelenkov (Mlearner)
 */
define( function( require ) {
  'use strict';

  var PropertySet = require( 'AXON/PropertySet' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  function GravityAndOrbitsModel( width, height ) {
    var self = this;
  }

  inherit( PropertySet, GravityAndOrbitsModel, {
    step: function() {},
    reset: function() {},
    clear: function() {}
  } );

  return GravityAndOrbitsModel;
} );