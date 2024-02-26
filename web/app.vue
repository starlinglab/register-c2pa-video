<template>
  <div>
    <VideoWithMetadata
      :c2pa="c2pa"
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
