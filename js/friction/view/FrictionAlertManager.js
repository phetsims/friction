// Copyright 2018, University of Colorado Boulder

/**
 * Manager for the alerts that are dynamically emitted in the simulation.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const Range = require( 'DOT/Range' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemperatureZoneEnum = require( 'FRICTION/friction/model/TemperatureZoneEnum' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );

  // a11y strings
  const frictionIncreasingTemperatureClausePatternString = FrictionA11yStrings.frictionIncreasingTemperatureClausePattern.value;
  const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperaturePattern.value;
  const surfaceString = FrictionA11yStrings.surface.value;

  // constants
  //TODO duplicated min/max constants with the screen view
  const THERMOMETER_MIN_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
  const THERMOMETER_MAX_TEMP = FrictionModel.MAGNIFIED_ATOMS_INFO.evaporationLimit * 1.1; // 7.7???

  const THERMOMETER_RANGE = THERMOMETER_MAX_TEMP - THERMOMETER_MIN_TEMP;
  const DIVIDED_RANGE = THERMOMETER_RANGE / 9;

  // a11y - [cool, warm, hot, very hot]
  const AMPLITUDE_RANGES = [ new Range( THERMOMETER_MIN_TEMP, 2 * DIVIDED_RANGE ),
    new Range( 2 * DIVIDED_RANGE, 5 * DIVIDED_RANGE ),
    new Range( 5 * DIVIDED_RANGE, 8 * DIVIDED_RANGE ),
    new Range( 8 * DIVIDED_RANGE, 9 * DIVIDED_RANGE )
  ];

  // sanity check to keep these in sync
  assert && assert( AMPLITUDE_RANGES.length === TemperatureZoneEnum.getOrdered().length );


  const amplitudeToTempZone = function( amplitude ) {
    var maxAmplitude = AMPLITUDE_RANGES[ AMPLITUDE_RANGES.length - 1 ].max;
    if ( amplitude > maxAmplitude ) {
      amplitude = maxAmplitude;
    }
    let rangeIndex;
    for ( let i = AMPLITUDE_RANGES.length - 1; i >= 0; i-- ) {
      let range = AMPLITUDE_RANGES[ i ];
      if ( amplitude < range.max || // exclusive maximum
           ( i === AMPLITUDE_RANGES.length - 1 && amplitude === range.max ) ) { // edge case for the larges possible value in ranges
        rangeIndex = i;
      }
    }
    assert && assert( typeof rangeIndex === 'number' );

    return TemperatureZoneEnum.getOrdered()[ rangeIndex ];
  };


  var FrictionAlertManager = {

    setTemperatureAlert: function( newAmplitude, oldAmplitude ) {

      let newZone = amplitudeToTempZone( newAmplitude );
      let oldZone = amplitudeToTempZone( oldAmplitude );

      assert && assert( TemperatureZoneEnum[ newZone ] );
      assert && assert( TemperatureZoneEnum[ oldZone ] );

      var zones = TemperatureZoneEnum.getOrdered();
      var newZoneIndex = zones.indexOf( newZone );
      var oldZoneIndex = zones.indexOf( oldZone );

      let relativePosition;
      if ( newZoneIndex === oldZoneIndex ) {
        relativePosition = FrictionConstants.SAME;
      }

      // came from less energy
      if ( newZoneIndex > oldZoneIndex ) {
        relativePosition = FrictionConstants.LESS;
      }


      var getTemperatureClause = function( tempString, surface ) {
        return StringUtils.fillIn( frictionIncreasingTemperatureClausePatternString, {
          surface: surface ? surfaceString : '',
          temperature: tempString
        } );
      };

      let alertObject = FrictionConstants.ALERT_SCHEMA[ newZone ][ relativePosition ];

      // some relationships don't have alerts to give out
      if ( alertObject ) {

        var string = StringUtils.fillIn( frictionIncreasingAtomsJigglingTemperaturePatternString, {
          temperatureClause: getTemperatureClause( alertObject.temp, alertObject.useSurface ),
          jigglingAmount: alertObject.jiggle
        } );
        utteranceQueue.addToBack( string );
      }

    }

  };

  friction.register( 'FrictionAlertManager', FrictionAlertManager );

  return FrictionAlertManager;
} );