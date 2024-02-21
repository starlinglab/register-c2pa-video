<template>
  <div>
    <div>
      <input type="file" @change="onFileChange">
      <br>
      <video control ref="videoPreview"></video>
    </div>
    <div>
      <h2>Video Metadata</h2>
      <table>
        <tr>
          <td>Title</td>
          <td>{{ c2paActiveManifest?.title }}</td>
        </tr>
        <tr>
          <td>Producer</td>
          <td>{{ c2paProducerName }}</td>
        </tr>
        <tr>
          <td>Published By</td>
          <td>{{ c2paActiveManifest?.claimGenerator }}</td>
        </tr>
        <tr>
          <td>FingerPrint</td>
          <td>{{ fileCid }}</td>
        </tr>
      </table>
    </div>
    <div>
      <h2>Authenticity Metadata</h2>
      <h3>c2pa</h3>
      <div v-if="c2paValidationError">
        Invalid: {{ c2paValidationError }}
      </div>
      <div v-else-if="c2paActiveManifest">
        Verified
        <button @click="showC2paManifestStore = !showC2paManifestStore">
          Show manifest store
        </button>
        <div v-if="showC2paManifestStore">
          <h3>Manifest store</h3>
          <pre>
            {{ c2paManifestStoreString }}
          </pre>
        </div>
      </div>
      <div v-else>
        Not verified
      </div>
      <hr />
      <h3>Numbers</h3>
      <div v-if="numbersMetadata">
        Verified <a :href="`https://verify.numbersprotocol.io/?nid=${fileCid}`" target="_blank" rel="noopener">
          View on Numbers
        </a>
        <button @click="showNumbersMetadata = !showNumbersMetadata">View raw data</button>
        <div v-if="showNumbersMetadata">
          <h4>Numbers metadata</h4>
          <pre>
            {{ numbersMetadataString }}
          </pre>
        </div>
      </div>
      <div v-else>
        Not verified
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  createC2pa,
  selectProducer,
  type C2pa,
  type ManifestStore,
  type Manifest,
} from 'c2pa';
import wasmSrc from 'c2pa/dist/assets/wasm/toolkit_bg.wasm?url';
import workerSrc from 'c2pa/dist/c2pa.worker.js?url';
import Hash from 'ipfs-only-hash';

const c2paValidationError = ref('')
const c2paManifestStore = ref<ManifestStore | null>(null)
const fileCid = ref('')
const numbersMetadata = ref<any>(null)
const videoPreview = ref<HTMLInputElement | null>(null)

const showC2paManifestStore = ref(false)
const showNumbersMetadata = ref(false)

const c2paActiveManifest = computed(() => {
  return c2paManifestStore.value?.activeManifest as Manifest || null
})
const c2paManifestStoreString = computed(() => {
  return JSON.stringify(
    c2paManifestStore.value,
    (key, value) => key === 'parent' ? undefined : value,
    2,
  )
});
const c2paProducerName = computed(() => {
  if (!c2paActiveManifest.value) return 'Unknown'
  return selectProducer(c2paActiveManifest.value)?.name || 'Unknown'
})
const numbersMetadataString = computed(() => {
  return JSON.stringify(
    numbersMetadata.value,
    (key, value) => key === 'parent' ? undefined : value,
    2,
  )
});

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
  numbersMetadata.value = data.value
}

async function readC2pa(file: File) {
  const c2pa = await getC2pa();
  try {
    const { manifestStore } = await c2pa.read(file);
    console.log('manifestStore', manifestStore);
    if (manifestStore?.validationStatus?.length) {
      c2paValidationError.value = manifestStore.validationStatus.find((s: any) => s.code)?.code || '';
    } else {
      c2paValidationError.value = '';
    }
    c2paManifestStore.value = manifestStore;
  } catch (err) {
    console.error('Error reading image:', err);
  }
}

async function onFileChange (event: Event) {
  c2paManifestStore.value = null;
  numbersMetadata.value = null;
  if (videoPreview.value) videoPreview.value.src = '';
  if (!event?.target) { return }
  const files = (event.target as HTMLInputElement)?.files
  if (!files) { return }
  const [file] = files
  const blobURL = URL.createObjectURL(file);
  if (videoPreview.value) videoPreview.value.src = blobURL;
  await Promise.all([
    readC2pa(file),
    readFileCid(file),
  ]);
}

</script>
