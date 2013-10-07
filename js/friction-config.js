// Copyright 2002-2013, University of Colorado Boulder

/**
 * RequireJS configuration file for the Friction sim.  Paths are relative to
 * the location of this file.
 */
require.config( {

  deps: ['friction-main'],

  paths: {

    // third party libs
    text: '../../sherpa/text',

    // plugins
    string: '../../chipper/requirejs-plugins/string',

    // common directories, uppercase names to identify them in require imports
    ASSERT: '../../assert/js',
    AXON: '../../axon/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    PHET_CORE: '../../phet-core/js',
    PHETCOMMON: '../../phetcommon/js',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SUN: '../../sun/js',

    // this sim
    FRICTION: "."
  },

  urlArgs: new Date().getTime()  // cache buster to make browser reload all included scripts
} );