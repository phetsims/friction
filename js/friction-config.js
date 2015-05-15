// Copyright 2002-2013, University of Colorado Boulder

/**
 * RequireJS configuration file for the Friction sim.  Paths are relative to
 * the location of this file.
 */
require.config( {

  deps: [ 'friction-main' ],

  paths: {

    // third party libs
    text: '../../sherpa/lib/text-2.0.12',

    // plugins
    image: '../../chipper/js/requirejs-plugins/image',
    string: '../../chipper/js/requirejs-plugins/string',

    // common directories, uppercase names to identify them in require imports
    AXON: '../../axon/js',
    BRAND: '../../brand/js',
    DOT: '../../dot/js',
    JOIST: '../../joist/js',
    KITE: '../../kite/js',
    PHET_CORE: '../../phet-core/js',
    PHETCOMMON: '../../phetcommon/js',
    REPOSITORY: '..',
    SCENERY: '../../scenery/js',
    SCENERY_PHET: '../../scenery-phet/js',
    SUN: '../../sun/js',

    // this sim
    FRICTION: "."
  },

  // optional cache buster to make browser refresh load all included scripts, can be disabled with ?cacheBuster=false
  urlArgs: phet.chipper.getCacheBusterArgs()
} );