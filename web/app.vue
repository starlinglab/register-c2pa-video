<template>
  <div>
    <input type="file" @change="onFileChange">
    <br >
    <h2>Active manifest</h2>
    <pre v-if="activeManifestString">
      {{ activeManifestString }}
    </pre>
    <hr />
    <h2>Manifest store</h2>
    <pre v-if="manifestString">
      {{ manifestString }}
    </pre>
  </div>
</template>
<script setup lang="ts">
import { createC2pa, type C2pa } from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';

const manifestString = ref('')
const activeManifestString = ref('')
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
  await readC2pa(file)
}

</script>
