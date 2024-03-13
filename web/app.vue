<template>
  <main class="text-gray-400 bg-[#342B42] space-y-10 overflow-x-hidden">

    <section class="relative">
      <UContainer :ui="{ base: 'relative min-h-svh flex flex-col justify-center items-center gap-8 text-center' }">
        <svg ref="heroBgGraphic" class="absolute h-screen w-screen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1366 1366">
          <circle ref="heroCircleInDashed" cx="683" cy="683" r="649.84" fill="none" stroke="#fff" opacity=".5" stroke-dasharray="0 0 6.01 6.01" stroke-miterlimit="10"/>
          <g ref="heroCircleWithDots">
            <circle cx="683" cy="683" r="479.85" fill="none" stroke="#fff" stroke-miterlimit="10" stroke-width="3"/>
            <circle cx="1162.85" cy="683" r="6.36" fill="#fff" stroke-width="0"/>
            <circle cx="203.15" cy="683" r="6.36" fill="#fff" stroke-width="0"/>
          </g>
          <circle cx="683" cy="683" r="559.68" fill="none" opacity=".25" stroke="#fff" stroke-miterlimit="10" stroke-width="6"/>
        </svg>

        <h1 class="text-3xl md:text-6xl font-bold text-center font-mono text-gray-200">Authenticated Videos</h1>
        <p class="text-lg md:text-2xl">Sealing the pixels of each frame and their provenance with <span class="text-green-400 font-bold">cryptography</span></p>

        <UIcon name="i-heroicons-chevron-double-down-16-solid" class="animate-bounce absolute bottom-4 text-4xl" />
      </UContainer>
    </section>

    <section class="relative bg-gradient-to-t from-[#342B42] from-65%">
      <UContainer :ui="{ base: 'py-44 space-y-4 text-left text-lg', constrained: 'max-w-2xl' }">
        <p>We are experiencing an unprecedented time where videos can be generated and manipulated at incredibly low effort and cost, and yet convince most of the world that they are genuinely recorded history.</p>
        <p>As disputes around AI generated photos become frequent topics, and family photos of the Royal Family get published and unpublished by news rooms, <span class="text-green-400 font-bold">these controversies will no doubt find new instantiations in video content</span>.</p>
        <p>Video files are almost always post-processed through various stages before being published and distributed.  They are also prone to forms of manipulation that are not applicable to photo content.</p>
        <p>In this demo, <span class="text-green-400 font-bold">we explore the addition of authenticity steps to secure provenance information at these video processing stages of capture, edit, and transcode</span>.</p>
        <p>We do this by applying cryptographic methods and industry standards for content authenticity, including digital signatures, distributed ledgers, the C2PA standard, Numbers Protocol, Livepeer transcoding network, Filecoin storage network, IPFS and Storj data networks.</p>
      </UContainer>
    </section>

    <section>
      <UContainer :ui="{ base: 'py-10 space-y-8' }">
        <h2 class="text-gray-200 text-3xl md:text-4xl font-bold text-center">Sample Authenticated Video</h2>
        <VideoWithMetadata
          :c2pa="c2pa"
          :src="verifiedVideoSrc"
          caption="Authenticated video distributed with edit & transcode provenance metadata"
        />
      </UContainer>
    </section>

    <section class="relative z-[1] bg-[#b8bbd6] -skew-y-2">
      <UContainer :ui="{ base: 'py-10' }">
        <p class="py-10 text-center text-4xl text-black font-handwriting">Let's explore how an authenticated video is created.</p>
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
          caption="Original video without provanence data in C2PA manifests"
        />
      </UContainer>
      <UContainer :ui="{ base: 'pt-10 pb-20 space-y-8' }">
        <h2 class="text-gray-200 text-3xl md:text-4xl font-bold">But if the video was <span class="text-green-400">authenticated</span>,<br>its  <span class="text-red-400">tampered version</span> will not pass verification against authenticity records.</h2>
        <VideoWithMetadata
          :c2pa="c2pa"
          :src="tamperedVideoSrc"
          :expectedFingerprint="verifiedVideoFingerprint"
          caption="Video manipulated by vertically flipping the pixels"
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

const { $gsap } = useNuxtApp()

const heroBgGraphic = ref<SVGElement | null>(null)
const heroCircleInDashed = ref<SVGElement | null>(null)
const heroCircleWithDots = ref<SVGElement | null>(null)

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
  animateHero();
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

function animateHero() {
  $gsap.fromTo(heroBgGraphic.value, {
    scale: 1,
  }, {
    scale: 1.5,
    duration: 1,
  })

  $gsap.to(heroCircleInDashed.value, {
    rotate: -360,
    duration: 120,
    ease: 'linear',
    repeat: -1,
    transformOrigin: 'center', 
  })

  $gsap.to(heroCircleWithDots.value, {
    rotate: 360,
    duration: 60,
    ease: 'linear',
    repeat: -1,
    transformOrigin: 'center',
  })
}

</script>
