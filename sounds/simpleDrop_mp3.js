/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,SUQzAwAAAAAAIVRYWFgAAAAXAAAAU29mdHdhcmUATGF2ZjU3LjI1LjEwMP/7MMQAAAbY3S0UEYABJRCqwzaAAAABCAAcAAAWAHjGPiIiJ6f/9REKu7uiIn/u7n8RHd3P+oiIX///+if/uiIiIiIBgYP8QeD4fl02kLBSQNgWzHUg3x6TDh8WdkdBkBZjnm/roLlYofIEiZhw8DgVifzH6BSHQfC3+72n/x/+92YgVDXgnB8HQaCoS5Q5xc6Hf/1psAADDcFjEv/7MsQDg0fAQT5d14AxBwglAc9sF0RDNHjwKIpC2RjQbIKK0wPM4QhEYGAmYLgYAgCMAQQiCMxggB8CqLAgjKa40KLV7/G32YGKDW03uPzHtGNvLzowyQYDC/WgNucTkmDvMSUgc+gHMgNT9IIyIRMjGxJpBQcf+LFYWKgQs9QyYCAWoIe3JkWNDW+gtQ1YCgOQlI0dETp/xZMbwIf/+zLEB4JJHDsoTntggQGHZmmvaBQxPR3DhLBCMLsBkxahcTpzEwEkPceygQIGVWkRDZzysjiIw0eVuBADOwVJvaP8zIEuPV/s///+7+nQAUEAOWHN7CNmw/Aw4QMjAnGTM0kJoiA7C4hQCXBU4dsmRAiyqcaHAELYwSh0orzJu3OfKO/IVs/7f////9f7OtUAKfcAcDARqoOH1mFi//syxAaCCMw7Js57YEESh2VZv2wKZEwOBhDqVmPyNQBVk+HFAYiATU+90CAswAuFgIuedWkIHjBepdJUzb0k/4H5QXt3/Ql/q+j6t+v9JWokAHfRtcKdPTAJi7gDmEsamZqAbhnRWcJ6mNiIiSzjhpKALjSkE9TfARZpUF04Jpm2NB34zfrRcUvp93Rfq/9rv/3oAAAIARgIA4kdM//7MMQFAgiQOytN+2CBAQdlWc9sCu3DiDlaMPAHQwYhbzTkAgMEYAAACPGNgAIHjqjFciux4BHQYyk7focCUYLOPaC/qJYfJ//6/3f///7whECBoUYGF4Ka11k5hJhLmEENsaFAVZpQoc+XmgBBAnG5j7XiwH8HQEzE2cdgJQEW9cuX9yXl2eX/5z/0f///sQAACAAIDNxcK0hiVv/7MsQGAgc0OzEt+4AQ9Ydmpa9oDvmGAqBgYM5xyJBs0MUIlAeFwOAmFF3ZYvAgQcXsoFu6vfrv0n1Zwp///////1gNBCAG7HGO3mNWsOYKAHpgNisGIKCyYUQZSkn0KDzNBIdY1B7xAJfPNgfL6P9X/v8+iS7/6//2///wJkfoAABcADORszmYNTJ64w0QNjApEUMzECMSdHRHDzj/+zLEDoLGtDstDftAYNAHZVWvbA4GCg3SxVG5xEnyRFNlQA3t9zOZX/lvbllZT+ljsZzdzXrMS4BEwhw9TNjBaM5DzLLMBFYFIjLyWLKHsVXgZ0LuoQgTjzDN8/v/NdudQgAAjAAHngfI2GBlDDVAMBgzpivg8F3zUYiI0gnE1S40GaWGhbHClHla7sY1/fu7+jaQYIBcOaxka5pJ//syxB2Chig7Lwz7QGjeB2Xlr2QKxhdAUA0acw+gcC4J44E1IwiZTUBq5U+h6ZxkteJq+qvN3/lHbtr////////srgYNvEjV8s5hImzE9BRMJ4dk0HgYDTA0G/Jd0vgdcCiwASBzfkAEZIbu4/5WC3pVndv/PrOf////p/tBY1okwXYzhVoDBAAuMCAFAyMAFxZw3Mhp4dOFV3SWVP/7MMQtAsdINSQt+2BAu4dl4a9kDlI2EjSN8VRXa/3e/S540VUABFgANaKJNpi6KkhcDswChFjEgBRAARw0BBDRhfqD3LexkIOonWjvdqWc3/1v1eCYIDKhwDgMNpRIwLwFCrIjNZFeYdJ6uSQEiMDP6z+hbIKgW41WpRNP7v/oVH/+pQAEkAA3EmM8sTSThfMNYF8wZxnDLDBlNv/7MsQ7gkXwOzENeyBwvAamJa9wBiKO4iHoYgCjflVqdqzktzWln7SVTglbkcu3tSi+FTMKADLmrYeWZEY2gUYBgqbMgITBGXoywqDFnaYvor5lpRJRQa1HVD++fbv6v+3Xd//7e7/TtTnQ43g3OkVKMxkgCDCPJnMyEMgzMrMT0QYAmEgxOxp5lQEagOgBnZW60OlYBi/3at76Xtf/+zLEUAIGmDUnDftAYNwGpiWe5Apn/////+pJaAIxnspoBBsjQgRgFCMmAYCMqqN4SDIUgYU+8bUFthcVeOFYLbi83z6y3L+n////////egCAodUGbTobbqgBhoAkGAcNWZNwMwsWmRygsEFqTcgB+UnZS4BnAK8iiTNbka7/Pobv////9f+7/RA8zRw4x2ZNUhuswmQTTBcADMvA//syxF4CR0A5IA37YEDShqXlj2AOAsouG79jxgUSGiLtcd1oa0gFrgZKTH7v/e+kV+mn//s+qjTyUk5DQVoKEALhgcDUGW4ESJMDoMSieARh/y6gw4CWsh6YZNGSUA99qMc1e+2Mf//////0Iv6vrjQCJANNHDDKMwDHbzBQBfBI5BghBDjpYA9EAg4NNaSjaZVlmBmB8ONyanhX/f/7MMRqgkcsNSSte2BA1Iakmb9oCHPs3ql7lrt///7/9VPdAqA0wlQBjzF+NgPGMRQGCpfGeoOreM/0mVVQfR+WXubDxNqjuNS3WuPC3+igXV7/T//0ha5r1WdFd16IkSQIDwljgbzUrZHMPACkwbQiiZa8exnKjhEMhCHCMvYVQuCyTRDIq8bHtRXmufdu1t3a/o/3er6O7//btf/7MsR2gwcYNSAN+0BA7Iakjb9oCDXhTkrjbAQiMQMBgwAxQTKjBwFhssTxdILixpoWnkmK0NRQKD8oVTalehXdf9Tv3v/6P///xT2fWlfcxzCk6Y3xg2wQHTDuAqMC0eEwswjguPNirElIqHOWYaelpFn3NeGgdP2m3O/r/vq1drf3/T/+79ab9P9U0gVyNzlNuA/Mw3QFTBKHNMf/+zLEgIIHcCss7PcAUPUGpA2vaAgYGwygc12cteMHTiBGrIcnkdEI4PKgXINWuXP+z4j//6P+1H9t86vcR1/Sk0sTMcpjYta0MIgFQwNA6zMQAOEkQRTQcBCIINkF3IcdfqqRho3GlUWoc/9d+tPf/5aj/ZgLa2yRnujYprTBBbCQ1dU1skAuiaS0XJgdg5mCcJUZewPJrAx3zYGg//syxIgDR4Q7Hg17YEDuBqPJr2gIEi45I9/kCOllmdOQ+4KtF/fNZfQl/+v7v9vQi8Qaah/UYLMKxaXQ9iglIkgQGbFgnsYgq6hgWgPGBJwbEKrqGECitdI8HHafjL3zgkPZBcc3V69irtvXX+inp9+136+3o+5vejSxgxyLMd9rMwiATTAtGWMS0Gkxo4zVxLoULmgFPyrNB7PjOv/7MMSQA8dwNxwNe0BBCoajQb9sCAZE3R7c6PyJe5f20f/b0d39utNlcgKo6JkzIc0tgzcFOjCdAWMA0LoyFwBR4kAqxMQQwExL2tKhxo5KOuqOTvZM57iH3/d//cj+rt1JwyTVd00VJTRBgDdHRp2fG48bJhGIZpyCgYWYGKu0ti0fYnRSgIJsQVmXvZynvV7qoz6rutej/ZTqmP/7MsSUAgg4NRgN+0BA64Vj3a9wAD/6RqMTDNE4QYOEmCgiJh2gnK3ml0TBLvG6nPWBqxIezo2xSfeH/37t+j9n/b8Dahltz3f2uYvYaKOVEwzUoP7WWMbgcFUXMnhASFO9igpAMCIm5bJ3pLIWY8+YrexP6+3/r+Y36/teK6DwAaLmBFOW3BuoCA5IA0nN0XmGIDmJNYL8ELSqVw7/+zLEmYPHoC0aDftAQOWFY0GvaAjODRbIHwtRxE3DODxm9WyAHGHWv037q8UUn2cV/rV9m69tKgBtEBAYOMXG1NMAgCDAgo/QDWYBAhby2k75qCrGY0BX6GeXUZ5DVue9n9Gpf/Rb208lZ0/QFIokCAHJDlZmJTYABEQDwZAA6rYYyMEjxF6/b5MpcWZLfRsRXtfdTd71f2V9tH16//swxKIDBsgnIGx3IEDgBqNBn2QI2vvxr/pTAAAaqpca+KgQwtVBIDFTwDLzgP7KmUVWHmRJ+XpXJ6We9VHd1s9ua1QIro3fUpXu6gAKmkCBAHGBDzcfNBRRMFTAeJq+L0OfAJMG2bva6us5l3rt09Hufd/3cXX+34GdT/fYAG0yENuiscCgQ0NoHDfSbAUnh6HLaBupHazMu56e//syxK4CBtwnGgz3AEDiBOPZnuwA29TMeNe9/gIDvA/SlTOr3a/b/6w10BiUScB2VEhxMAr07YhrZKFeq4EfHaqwi578yV3NnPVKa7/c5pMiz0s9K9NtYv25KmnKVQBAABkoDgGf0OIKQZqI5nARfNIEKpHpBW0dAsW0kVgkSLPRa66eGpT7X1YqhGHXHG5tbBQPpYLExUkYaZFRIv/7MsS6AgacJx7M92AA2ATj3Z7gCB73uBw2SadHQEskQCo/zeDAgOUreS3hveXf5tR7Tpzm3HIptalki7n/ypp0/vmRyzq+hpx4jqbGaHap/VfLJ6IBgAQxi0cyM3jbSlgiQVnbuWYABbPojcq4c/vd704FPSml1k5ImTb3mpn2JeXDpVmJU1veHmuSSO/U3OiOhTkdgmTmZmoNT23/+zLEyIIGICcnLmXiEMeEo/WObABFhwp0stA2cAYBCMpFQgadpQKETk02OVmNFHJ2eAqhNkwMKF75KW6f3ZUrr6vyM120curX9l3V0RSIj6MJnOjzI6sZYJ1NJ826AJ2hAAzFUDEhi61KI6El2eUwxbou97Ycy79lp/vc9Dl8v79+a865Oj6MXHOWkUaAlcT0LDSx+ioPVyYg+4xg//swxNsCBjgnIM5p4hDRhOOZzTxIBRbh2gBQIQCHWJASAKw8ONJOFd2hXhIRK5evkcB0rO2k/lSMvPY2/LKRy9vq/dSOPCIuJ++y57S4tXcGppfGBBBIXSq+AH9bwD4QAMuBwC1FiCxBw5GvutY1jHnm2ZtwHW1L7nkRtsR9Lv5b+/mR9uD4x/5xoq3NyJZsayLOnEQdo1CPvEYk//syxOsCiOQpFs5pgkEJHqJVwI25Ft45OXzDdgAwBAgELwR4lYN1Zgxa6xvvMIRXlMMPxZh+Hi4V/b43/1SVmZmbUtVVVVVYMBMzexf/sy9CiSbWNsx1S4GFYU+KCm5JakxBTUUzLjk5LjOqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7MsTqAEiRCxAOBG3JBCHiYcCI+aqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuOTkuM6qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+zLE6wAIYQ0QLgRlyRcd4iG0jEGqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//swxOqACH0NDkZgYAkRoOCk8I15qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//syxLuDwAABpAAAACAAADSAAAAEqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==';
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