<template>
  <div v-bind="$attrs" class="space-y-4">
    <UCard
      :ui="{
        body: { padding: '' },
        footer: { base: 'flex items-center justify-center md:justify-end flex-wrap gap-4' },
      }"
    >
      <template #header>
        <h2 class="text-white text-xl md:text-2xl font-bold font-mono">Authentication Metadata</h2>
      </template>

      <UTable
        :rows="[
          { label: 'Original Recording By', value: recordedByName || 'Unknown' },
          { label: 'Edited and Published By', value: editedByName || 'Unknown' },
          { label: 'Transcoded By', value: transcodedByName || 'Unknown' },
          { label: 'Fingerprint', value: fileCid },
          { label: 'Registration Time', value: registrationTime },
        ]"
        :ui="{ th: { base: 'hidden' } }"
      >
        <template #label-data="{ row }">
          <span class="font-bold font-mono">{{ row.label }}</span>
        </template>
        <template #value-data="{ row }">
          <span
            v-if="row.label === 'Fingerprint'"
            class="text-xs font-mono"
          >{{ row.value }}</span>
          <template v-else>
            {{ row.value }}
          </template>
        </template>
      </UTable>

      <template #footer>
        <span class="font-bold font-mono">Download File</span>
        <UButton
          icon="i-heroicons-arrow-top-right-on-square-16-solid"
          label="IPFS"
          :to="`https://ipfs.io/ipfs/${fileCid}`"
          variant="outline"
          rel="noopener"
          target="_blank"
        />
        <UButton
          icon="i-heroicons-arrow-top-right-on-square-16-solid"
          label="Storj"
          :to="src"
          variant="outline"
          rel="noopener"
          target="_blank"
        />
      </template>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="text-white text-xl md:text-2xl font-bold font-mono">Verifications</h2>
      </template>

      <ul class="space-y-4">
        <li class="space-y-2">
          <h3 class="flex items-center text-lg font-bold gap-2 font-mono text-gray-200">
            C2PA
            <UBadge
              v-if="c2paValidationError"
              color="red"
              variant="subtle"
              :ui="{ rounded: 'rounded-full' }"
            >Verification Failed</UBadge>
            <UBadge
              v-else-if="c2paActiveManifest"
              color="green"
              variant="subtle"
              :ui="{ rounded: 'rounded-full' }"
            >Verified</UBadge>
            <UBadge
              v-else="c2paActiveManifest"
              color="red"
              variant="subtle"
              :ui="{ rounded: 'rounded-full' }"
            >Missing C2PA Data</UBadge>
          </h3>

          <UAlert v-if="c2paValidationError"
            class="font-mono"
            icon="i-heroicons-exclamation-triangle-16-solid"
            title="Invalid"
            :description="c2paValidationError"
            color="red"
            variant="subtle"
          />

          <div
            v-else-if="c2paActiveManifest"
            class="flex items-center gap-4"
          >
            <UButton
              v-if="verificationSrc"
              icon="i-heroicons-arrow-top-right-on-square-16-solid"
              label="View Verification"
              :to="verificationSrc"
              variant="outline"
              rel="noopener"
              target="_blank"
            />

            <UButton
              label="View Raw Data"
              variant="outline"
              @click="showC2paManifestStore = !showC2paManifestStore"
            />
          </div>
        </li>

        <li class="space-y-2">
          <h3 class="flex items-center text-lg font-bold gap-2 font-mono text-gray-200">
            Numbers
            <UBadge
              v-if="expectedFingerprint && expectedFingerprint !== fileCid"
              color="red"
              variant="subtle"
              :ui="{ rounded: 'rounded-full' }"
            >Verification Failed</UBadge>
            <UBadge
              v-else-if="numbersMetadata"
              color="green"
              variant="subtle"
              :ui="{ rounded: 'rounded-full' }"
            >Verified</UBadge>
            <UBadge
              v-else
              color="red"
              variant="subtle"
              :ui="{ rounded: 'rounded-full' }"
            >Missing Numbers Registration</UBadge>
          </h3>

          <UAlert
            v-if="expectedFingerprint && expectedFingerprint !== fileCid"
            class="font-mono"
            icon="i-heroicons-exclamation-triangle-16-solid"
            title="Invalid"
            description="Expected fingerprint does not match file fingerprint"
            color="red"
            variant="subtle"
          />

          <div
            v-else-if="numbersMetadata"
            class="flex items-center flex-wrap gap-4"
          >
            <UButton
              label="View on Numbers"
              icon="i-heroicons-arrow-top-right-on-square-16-solid"
              :to="`https://verify.numbersprotocol.io/?nid=${fileCid}`"
              variant="outline"
              target="_blank"
              rel="noopener"
            />
            <UButton
              label="View Raw Data"
              variant="outline"
              @click="showNumbersMetadata = !showNumbersMetadata"
            />
          </div>
        </li>
      </ul>
    </UCard>
  </div>

  <UModal
    v-model="showC2paManifestStore"
    :ui="{ width: 'sm:max-w-2xl' }"
  >
    <UCard
      :ui="{
        header: { base: 'flex items-center justify-between' },
        body: { base: 'overflow-x-auto' },
      }"
    >
      <template #header>
        <h3 class="font-bold font-mono text-gray-200">Manifest Store</h3>
        <UButton
          icon="i-heroicons-x-mark-16-solid"
          variant="ghost"
          @click="showC2paManifestStore = false"
        />
      </template>
      <pre class="text-xs">{{ c2paManifestStoreString }}</pre>
    </UCard>
  </UModal>

  <UModal
    v-model="showNumbersMetadata"
    :ui="{ width: 'sm:max-w-2xl' }"
  >
    <UCard
      :ui="{
        header: { base: 'flex items-center justify-between' },
        body: { base: 'overflow-x-auto' },
      }"
    >
      <template #header>
        <h3 class="font-bold font-mono text-gray-200">Numbers Metadata</h3>
        <UButton
          icon="i-heroicons-x-mark-16-solid"
          variant="ghost"
          @click="showNumbersMetadata = false"
        />
      </template>
      <pre class="text-xs">{{ numbersMetadataString }}</pre>
    </UCard>
  </UModal>
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
  if (!props.src) return ''
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
