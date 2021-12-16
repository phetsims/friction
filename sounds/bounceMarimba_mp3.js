/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
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