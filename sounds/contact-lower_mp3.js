/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,//swxAAABqQXORQxgAkqmO7nIFAAAAhAAOu5xCcAADD4DvDw8f4AAADsAAAd/Q8PzeI68PeAABkcfxwjN/4AAAAOEf4j////44eA15BlSwqKDIAT8LJhsAllVM0PqSs5sXshPZz/Q4cZwECw6HBg8aGEI0lxjAXRh7HPaNarlJ12yEZcykFV8gb5SgVdnyaz4Y9B/l0BSa60SAAE//syxAOASFjNZ52VABEComstp5xyyZlwOGYs41WW2H+nYal2Va/QS604pOUqTHm/oPhBAKkdTSyhSm/+7SE7PN/9H+v/0WpATZM/zuh/3lpIBOW2wLZYc2kLUH6KxbRirUDxjp/ZJTwZSwYjDhf/ygFjbVHAKp/46bA0s0c/+PC75rf/G1AJHVb/5R/kv/3xrWoAmUW0UIAAIC4Fqv/7MsQFgEixE0+OPUORCCIobcadcphoHw0SlPMMJJrZirX/M6NaQkOLAaO/6CWFAQlh8kHhPO/8o8SRNaR//R/o3/qNdy1SX/5349/+vIqwAEw4hwweBjrBiEvMRBhOJvZFRP3K45V5k1IJ07O3/mIXF0TrMPwcT/9y+Oi3M/+hf5T/6E6hUtRf/lW3x7/68dk6AVFj4AYEwYuapRz/+zLEBYBIaRE3D21BEQoiJUnsnFlkQDSERAC+1DGRuxDk/e6NUtjFv/Fwbs5Z5EB7/4qtGIKcj/+UG2dkT//IsVXoO//NffIf/q1SKllDDsEVNIt00zqAwTCTA6PJM0wAwFWKDqCU2m7a//7gFMgRPEIlL/2EzrDOOf/Qvtq//xJoIBnJf/FT1bKP/6tjrpbADATGBOHjbE1LxlzD//swxAaDSIkRIC9pQsEHIiNB/RRYWBuOarNAOMaDAwAvGu9xJe3bO0/+LwUuaRtEkUN/7tQlz//oX3yr//G1BBHSpb/7ttn//m1IpEwPcNeMWsX0DF5QsIwPYDtPjuNw1MuWAgVmT8sufkeRjoQg5af/II4jiIL/8uM6f/R/r/+TOOsK/94iu2yf/LQRkTIYFOPrV5w5qgLjFJAL//syxAcCyGg1Fg9pIsDeA2JV/2gAPUiOKTDthQ7L4IeKrvYFj4pUJirSrmrZSkC4SHgI24OkljZoiVsIlV+W6ltTohOe9z91FuXEYQEGXmOrKZZraFcmEeHQbDeZF0ADoqIT3Zu0GFWfH22J/T96i33uuXfyNSKFzci+ibiRgZbHNgPqqphi0UR0ZZQul4KNkNGGkQ3i0Qtjkq9Oiv/7MsQNggZEGRrO5eIQxILi5e28ABtzhlKvkFfXsYreLKbuzb4yxoaZr/8OzMsoEGI4D4ZNKKBpskYGPgKAs5dD/VjyO5bb1ms3nsog2ZKizkbPv9qb/9+vcPF/+moACFGUQg1aGExTnM5sIwEPi/LBgMkzAhNzi6qMkixqVvDv1GP04t4RfVaqr9Df1Yw5o7zxVxM3RgyN7QCcaIz/+zLEH4IGABMVLvEgQPICoUHMJAn7LCXnFvhX/duQn////4/Nlf/t8uVV/+xW4r+dewcUmp6hUvcLgDOZxdRO1qQaAApm/gMMxfjkWwXTDCQSQoiyU4q5UX5HDWJSxIqISwdU/5GJXflnq9T4ifR+Cp7lmpAQMygMgnM/aMVdFbwBtmenHNSh305zs26DMvAuA5mFsDFrNZw6Rzsl//swxC0AxggPBS3lIBDShgYhrOkWDiPzSzjEUyFII0tMQU1FMy45OS4zVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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