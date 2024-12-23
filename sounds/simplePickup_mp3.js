/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//swxNACRggTHw5hAhDGAiLB3KRAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxOKCBrARGUfwwEDfguPmtiACVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsTvgBAVHxsZx4AAAAA0g4AABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;