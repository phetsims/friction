/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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/eIQt4zKTMx1QFjVVVds9mqzsdZEiRljiJEjn9OCktNIo5RJI4GJb6okAiKuxIBJ//swxMqCBqgZISZzAADGgyOFzDBCGgEloAAMGRlZczWWWWS/LmSsssqOf//GWWWORMssstlllI2VrKjoR//KsssqOZSyyxlayo4wkMFDAwQcIPdVVUElaYYhTEFNRTMuOTkuM1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//syxNqABrwXHy2N5ECkgeVYbCQCVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7MsTvAQmhFRTHvGCA96Rh4BCmOFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+zLE7YDI7SUEgIzcQQWfT2AQjAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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