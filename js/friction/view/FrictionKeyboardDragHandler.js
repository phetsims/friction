// Copyright 2017-2018, University of Colorado Boulder

/**
 * Keyboard drag handler used for a11y keyboard navigation for both the BookNode and the MagnifierNode atoms.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const friction = require( 'FRICTION/friction' );
  const FrictionA11yStrings = require( 'FRICTION/friction/FrictionA11yStrings' );
  const FrictionConstants = require( 'FRICTION/friction/FrictionConstants' );
  const FrictionModel = require( 'FRICTION/friction/model/FrictionModel' );
  const inherit = require( 'PHET_CORE/inherit' );
  const KeyboardDragListener = require( 'SCENERY_PHET/accessibility/listeners/KeyboardDragListener' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const TemperatureZoneEnum = require( 'FRICTION/friction/model/TemperatureZoneEnum' );
  const utteranceQueue = require( 'SCENERY_PHET/accessibility/utteranceQueue' );
  const Vector2 = require( 'DOT/Vector2' );
  const Range = require( 'DOT/Range' );

  // a11y strings
  const frictionIncreasingTemperatureClausePatternString = FrictionA11yStrings.frictionIncreasingTemperatureClausePattern.value;
  const frictionIncreasingAtomsJigglingTemperaturePatternString = FrictionA11yStrings.frictionIncreasingAtomsJigglingTemperaturePattern.value;
  const surfaceString = FrictionA11yStrings.surface.value;

  // constants
  //TODO duplicated with the screen view
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

  /**
   * @param {FrictionModel} model
   * @constructor
   */
  function FrictionKeyboardDragHandler( model ) {

    let oldPositionValue; // determines our delta for how the positionProperty changed every drag

    let oldAmplitude = model.amplitudeProperty.value; // keep track of the previous temperature

    KeyboardDragListener.call( this, {
      downDelta: 10,
      shiftDownDelta: 5,
      locationProperty: model.topBookPositionProperty,
      start: function() {
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },
      drag: function() {
        let newValue = model.topBookPositionProperty.get();
        model.move( new Vector2( newValue.x - oldPositionValue.x, newValue.y - oldPositionValue.y ) );
        // update the oldPositionValue for the next onDrag
        oldPositionValue = model.topBookPositionProperty.get().copy();
      },

      // send an alert based on the drag activity
      end: function() {
        let newAmplitude = model.amplitudeProperty.value;

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
        oldAmplitude = newAmplitude;

      },
      dragBounds: new Bounds2(
        -FrictionModel.MAX_X_DISPLACEMENT, // left bound
        FrictionModel.MIN_Y_POSITION, // top bound
        FrictionModel.MAX_X_DISPLACEMENT, // right bound
        2000 ) // bottom, arbitrary because the model stops the motion when the top atoms collide with the bottom book
    } );
  }

  friction.register( 'FrictionKeyboardDragHandler', FrictionKeyboardDragHandler );

  return inherit( KeyboardDragListener, FrictionKeyboardDragHandler );
} );