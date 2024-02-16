<template>
  <div>
    <input type="file" @change="onFileChange">
    <br >
    <h2>c2pa</h2>
    <h3>Active manifest</h3>
    <pre v-if="activeManifestString">
      {{ activeManifestString }}
    </pre>
    <hr />
    <h3>Manifest store</h3>
    <pre v-if="manifestString">
      {{ manifestString }}
    </pre>
    <hr />
    <h2>Numbers</h2>
    <h3>cid</h3>
    <pre v-if="fileCid">
      {{ fileCid }}
    </pre>
    <hr />
    <h3>metadata</h3>
    <pre v-if="numbersMetadataString">
      {{ numbersMetadataString }}
    </pre>
  </div>
</template>
<script setup lang="ts">
import { createC2pa, type C2pa } from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';
import Hash from 'ipfs-only-hash';

const manifestString = ref('')
const activeManifestString = ref('')
const fileCid = ref('')
const numbersMetadataString = ref('')
let c2pa: C2pa | null = null

onMounted(() => {
  getC2pa();
})

async function getC2pa() {
  if (!c2pa) {
    c2pa = await createC2pa({
      wasmSrc,
      workerSrc,
    })
  }
  return c2pa;
}

async function readFileCid(file: File) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const buffer = e.target?.result as ArrayBuffer
      fileCid.value = await Hash.of(new Uint8Array(buffer), { cidVersion: 1, rawLeaves: true })
      fetchNumbersMetadata(fileCid.value)
    } catch (err) {
      console.error('Error reading file:', err)
    }
  }
  reader.readAsArrayBuffer(file)
}

async function fetchNumbersMetadata(cid: string) {
  const { data } = await useFetch(`https://api.numbersprotocol.io/api/v3/assets/${cid}`)
  const metadata = data.value
  numbersMetadataString.value = JSON.stringify(metadata, null, 2)
}

async function readC2pa(file: File) {
  const c2pa = await getC2pa();
  try {
    const { manifestStore } = await c2pa.read(file);
    console.log('manifestStore', manifestStore);
    manifestString.value = JSON.stringify(
      manifestStore,
      (key, value) => key === 'parent' ? undefined : value,
      2,
    )

    // Get the active manifest
    const activeManifest = manifestStore?.activeManifest;
    console.log('activeManifest', activeManifest);
    activeManifestString.value = JSON.stringify(
      activeManifest,
      (key, value) => key === 'parent' ? undefined : value,
      2,
    )
  } catch (err) {
    console.error('Error reading image:', err);
  }
}

async function onFileChange (event: Event) {
  if (!event?.target) { return }
  const files = (event.target as HTMLInputElement)?.files
  if (!files) { return }
  const [file] = files
  await Promise.all([
    readC2pa(file),
    readFileCid(file),
  ]);
}

</script>
