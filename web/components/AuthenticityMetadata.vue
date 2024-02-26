<template>
  <div>
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
  selectProducer,
  type Manifest,
  type ManifestStore,
} from 'c2pa';

const props = defineProps<{
  c2paManifestStore: ManifestStore | null,
  c2paValidationError?: string,
  fileCid?: string,
}>()

const showC2paManifestStore = ref(false)
const showNumbersMetadata = ref(false)

const numbersMetadata = ref<any>(null)

watch(() => props.fileCid, (fileCid: string | undefined) => {
  if (fileCid) {
    fetchNumbersMetadata(fileCid)
  } else {
    numbersMetadata.value = null
  }
})

const c2paActiveManifest = computed(() => {
  return props.c2paManifestStore?.activeManifest as Manifest || null
})
const c2paManifestStoreString = computed(() => {
  return JSON.stringify(
    props.c2paManifestStore,
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

async function fetchNumbersMetadata(cid: string) {
  const { data } = await useFetch(`https://api.numbersprotocol.io/api/v3/assets/${cid}`)
  numbersMetadata.value = data.value
}

</script>
