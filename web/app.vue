<template>
  <div>
    <h1>Authenticated Video Archives</h1>
    <p>Welcome, technical creators, to the intriguing world of Authenticated Video Archives. In this era of vast digital content, the need for secure and verifiable video storage and distribution has become paramount. Authenticated Video Archives offer a revolutionary solution by ensuring the integrity, authenticity, and tamper-proof nature of video assets. By employing advanced cryptographic techniques, these archives verify the origin and integrity of videos, providing an added layer of trust to the content and protecting it from unauthorized modifications. As technical creators, understanding the intricacies of Authenticated Video Archives opens up a realm of possibilities for creating, preserving, and sharing video content with enhanced security and credibility. Let's embark on this journey together and explore the exciting potential of Authenticated Video Archives.</p>
    <hr />
    <h2>Authenticated Video</h2>
    <VideoWithMetadata
      :c2pa="c2pa"
      :src="verifiedVideoSrc"
    />
    <hr />
    <p>(flowchart placeholder)</p>
    <hr />
    <h2>Videos without authentication can be prone to
malicious tampering that goes unnoticed.</h2>
    <VideoWithMetadata
      :c2pa="c2pa"
      :src="unsignedVideoSrc"
    />
    <h2>But if the video was authenticated, its tampered
version will not pass verification against authenticity 
records.</h2>
    <VideoWithMetadata
      :c2pa="c2pa"
      :src="tamperedVideoSrc"
      :expectedFingerprint="verifiedVideoFingerprint"
    />
  </div>
</template>
<script setup lang="ts">
import {
  createC2pa,
  type C2pa,
} from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';

const c2pa = ref<C2pa | null>(null)
const verifiedVideoSrc = ref('https://link.storjshare.io/raw/juebac5porpkkwa32blakincs3oq/livepeer%2Fweb%2F270p0.mp4')
const unsignedVideoSrc = ref('https://link.storjshare.io/raw/juxnk53eoskzswc7ltdzqy3yqrba/livepeer%2Fweb%2F270p0_unsigned.mp4')
const tamperedVideoSrc = ref('https://link.storjshare.io/raw/jwkrtpvw5km2uykkj6fncvgcnl2a/livepeer%2Fweb%2F270p0_flipped.mp4')
const verifiedVideoFingerprint = ref('bafkreihx7qgg3v5wirghzrxzotgqwatgtoawtzc2jvr7akgdzoupxgjjxe')

onMounted(() => {
  getC2pa();
})

async function getC2pa() {
  if (!c2pa.value) {
    c2pa.value = await createC2pa({
      wasmSrc,
      workerSrc,
    })
  }
  return c2pa.value;
}

</script>
