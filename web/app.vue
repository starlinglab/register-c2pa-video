<template>
  <main class="text-gray-400 bg-[#342B42] space-y-10">

    <section class="relative">
      <UContainer :ui="{ base: 'min-h-svh flex flex-col justify-center items-center gap-8 text-center' }">
        <h1 class="text-3xl md:text-6xl font-bold text-center font-mono text-gray-200">Authenticated Video Archives</h1>
        <p class="text-lg md:text-2xl">Welcome, technical creators, to the intriguing world of <span class="text-green-400 font-bold">Authenticated Video Archives</span>.</p>

        <UIcon name="i-heroicons-chevron-double-down-16-solid" class="animate-bounce absolute bottom-4 text-4xl" />
      </UContainer>
    </section>

    <section>
      <UContainer :ui="{ base: 'py-44 space-y-4 text-center text-lg', constrained: 'max-w-2xl' }">
        <p>In this era of vast digital content, the need for secure and verifiable video storage and distribution has become paramount. Authenticated Video Archives offer a revolutionary solution by ensuring the integrity, authenticity, and tamper-proof nature of video assets.</p>
        <p>By employing advanced cryptographic techniques, these archives verify the origin and integrity of videos, providing an added layer of trust to the content and protecting it from unauthorized modifications.</p>
        <p>As technical creators, understanding the intricacies of <span class="text-green-400 font-bold">Authenticated Video Archives</span> opens up a realm of possibilities for creating, preserving, and sharing video content with enhanced security and credibility.</p>
      </UContainer>
    </section>

    <section>
      <UContainer :ui="{ base: 'py-10 space-y-8' }">
        <h2 class="text-gray-200 text-3xl md:text-4xl font-bold text-center">Authenticated Video</h2>
        <VideoWithMetadata
          :c2pa="c2pa"
          :src="verifiedVideoSrc"
          caption="Edited & transcoded"
        />
      </UContainer>
    </section>

    <section class="relative z-[1] bg-[#b8bbd6] -skew-y-2">
      <UContainer :ui="{ base: 'py-10' }">
        <p class="py-10 text-center text-4xl text-black font-handwriting">Let's embark on this journey together and explore the exciting potential of Authenticated Video Archives.</p>
      </UContainer>
    </section>

    <section class="!-mt-10">
      <WorkflowAnimation
        class="w-full"
        :original-video-src="originalVideoSrc"
        :original-video-fingerprint="originalVideoFingerprint"
        :edited-video-src="editedVideoSrc"
        :edited-video-fingerprint="editedVideoFingerprint"
        :transcoded-video-src="verifiedVideoSrc"
        :transcoded-video-fingerprint="verifiedVideoFingerprint"
      />
    </section>

    <!-- <section>
      <UContainer :ui="{ base: 'py-10'}">
        <UCard :ui="{ body: { padding: '' } }">
          <UTable
            :rows="flowchartData"
            :columns="[
              { label: '', key: 'label' },
              { label: 'IPFS', key: 'ipfsSrc' },
              { label: 'Numbers', key: 'numbersSrc' },
            ]"
          >
            <template #label-data="{ row }">
              <span class="font-bold font-mono">{{ row.label }}</span>
            </template>
            <template #ipfsSrc-data="{ row }">
              <UButton
                :label="row.fingerprint"
                :to="row.ipfsSrc"
                variant="link"
                :padded="false"
              />
            </template>
            <template #numbersSrc-data="{ row }">
              <UButton
                icon="i-heroicons-arrow-top-right-on-square-16-solid"
                label="Numbers"
                variant="outline"
                :to="row.numbersSrc"
              />
            </template>
          </UTable>
        </UCard>
      </UContainer>
    </section> -->

    <section>
      <UContainer :ui="{ base: 'py-10 space-y-8' }">
        <h2 class="text-gray-200 text-3xl md:text-4xl font-bold">If the video is <span class="text-red-400">unauthenticated</span>,<br>it can be prone to malicious tampering that goes unnoticed.</h2>
        <VideoWithMetadata
          :c2pa="c2pa"
          :src="unsignedVideoSrc"
          caption="Original without C2PA"
        />
      </UContainer>
      <UContainer :ui="{ base: 'pt-10 pb-20 space-y-8' }">
        <h2 class="text-gray-200 text-3xl md:text-4xl font-bold">But if the video was <span class="text-green-400">authenticated</span>,<br>its  <span class="text-red-400">tampered version</span> will not pass verification against authenticity records.</h2>
        <VideoWithMetadata
          :c2pa="c2pa"
          :src="tamperedVideoSrc"
          :expectedFingerprint="verifiedVideoFingerprint"
          caption="Pixels are manipulated and vertically flipped of the original"
        />
      </UContainer>
    </section>

    <footer class="min-h-44 bg-gradient-to-t from-gray-900/75 to-gray-900/0" />
  </main>
</template>

<script setup lang="ts">
import {
  createC2pa,
  type C2pa,
} from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';

const c2pa = ref<C2pa | null>(null)
const originalVideoSrc = ref('https://link.storjshare.io/raw/jxyzymdzw4q35txvbupgzifa7tmq/livepeer%2Fweb%2F270p0_original.mp4')
const originalVideoFingerprint = ref('bafybeie2gm7rgjhulkc3nsxlx5aiw6ozysc4s57e5w3ukvuxhp6zn7h4pe')
const editedVideoSrc = ref('https://link.storjshare.io/raw/jxo7sjlcjratvwadrxm4l4f5rfxq/livepeer%2Fweb%2F270p0_signed.mp4')
const editedVideoFingerprint = ref('bafybeifoh4scijvcyju2tlwtbbkadtnyuvpch53dcvauxv2phdz6z7ebfe')
const verifiedVideoSrc = ref('https://link.storjshare.io/raw/jufatrrm5yzrisvuf4zhxekszika/livepeer%2Fweb%2F270p0_transcoded.mp4')
const verifiedVideoFingerprint = ref('bafybeiakdsjpqizxy5656qzsnsgsdlewxdjy6smxz23kaaalibh3y6gnqm')
const unsignedVideoSrc = ref('https://link.storjshare.io/raw/juqco555j63eavzux2rcritw4wuq/livepeer%2Fweb%2F270p0_unsigned.mp4')
const tamperedVideoSrc = ref('https://link.storjshare.io/raw/jwcbqpimxjo3lrg4wqrsrxcisnqq/livepeer%2Fweb%2F270p0_flipped.mp4')

onMounted(() => {
  getC2pa();
})

const flowchartData = computed(() =>
  [
    { label: 'Original', src: originalVideoSrc.value, fingerprint: originalVideoFingerprint.value },
    { label: 'Edited', src: editedVideoSrc.value, fingerprint: editedVideoFingerprint.value },
    { label: 'Transcoded', src: verifiedVideoSrc.value, fingerprint: verifiedVideoFingerprint.value },
  ].map(i => ({
    label: i.label,
    src: i.src,
    ipfsSrc: `https://ipfs.io/ipfs/${i.fingerprint}`,
    numbersSrc: `https://verify.numbersprotocol.io/?nid=${i.fingerprint}`,
    fingerprint: i.fingerprint,
  }))
)

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
