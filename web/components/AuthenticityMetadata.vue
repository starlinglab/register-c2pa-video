<template>
  <div>
    <div>
      <h2>Authentication Metadata</h2>
      <table>
        <tr>
          <td>Original Recording By</td>
          <td>{{ recordedByName || 'Unknown' }}</td>
        </tr>
        <tr>
          <td>Edited and Published By</td>
          <td>{{ editedByName || 'Unknown' }}</td>
        </tr>
        <tr v-if="transcodedByName">
          <td>Transcoded By</td>
          <td>{{ transcodedByName }}</td>
        </tr>
        <tr>
          <td>Fingerprint</td>
          <td>{{ fileCid }}</td>
        </tr>
        <tr>
          <td>Registration Time</td>
          <td><time>{{ registrationTime }}</time></td>
        </tr>
        <tr>
          <td>
            <a
              :href="`https://ipfs.io/ipfs/${fileCid}`"
              rel="noopener"
              target="_blank"
            >
              View on IPFS
            </a>
          </td>
          <td>
            <a
              :href="src"
              rel="noopener"
              target="_blank"
            >
              View original file
            </a>
          </td>
        </tr>
      </table>
    </div>
    <div>
      <h2>Verifications</h2>
      <h3>c2pa</h3>
      <div v-if="c2paValidationError">
        Invalid: {{ c2paValidationError }}
      </div>
      <div v-else-if="c2paActiveManifest">
        Verified
        <a v-if="verificationSrc" :href="verificationSrc" rel="noopener" target="_blank">
          View verification
        </a>
        <button v-else @click="showC2paManifestStore = !showC2paManifestStore">
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
      <div v-if="expectedFingerprint && expectedFingerprint !== fileCid">
        Invalid: Expected fingerprint does not match file fingerprint
      </div>
      <div v-else-if="numbersMetadata">
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
  expectedFingerprint?: string,
  src?: string,
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

const registrationTime = computed(() => {
  if (!numbersMetadata.value) return 'Unknown'
  return new Date(numbersMetadata.value.uploaded_at).toLocaleString()
})
const verificationSrc = computed(() => {
  if (!props.src) ''
  return `https://verify.contentauthenticity.org/inspect?source=${encodeURIComponent(props.src)}`
})

const recordedByName = computed(() => {
  if (!props.c2paManifestStore) return undefined;
  const manifest = Object.values(props.c2paManifestStore.manifests)
    .find((m => m.assertions.data.find(a => a.label === 'c2pa.actions'
      && (a.data as any).actions?.[0].action === 'c2pa.created')))
  return manifest ? selectProducer(manifest)?.name : undefined
})

const editedByName = computed(() => {
  if (!props.c2paManifestStore) return undefined;
  const manifest = Object.values(props.c2paManifestStore.manifests)
    .find((m => m.assertions.data.find(a => a.label === 'c2pa.actions'
      && (a.data as any).actions?.[0].action === 'c2pa.unknown')))
  return manifest ? selectProducer(manifest)?.name : undefined
})

const transcodedByName = computed(() => {
  if (!props.c2paManifestStore) return undefined;
  const manifest = Object.values(props.c2paManifestStore.manifests)
    .find(m => m.claimGenerator.includes('Livepeer'))
  return manifest ? manifest.claimGenerator : undefined
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
