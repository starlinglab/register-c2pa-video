<template>
  <div>
    <div>
      <input v-if="!src" type="file" @change="onFileChange">
      <br>
      <video :src="src || undefined" control ref="videoPreview"></video>
    </div>
    <AuthenticityMetadata :c2paValidationError="c2paValidationError" :c2paManifestStore="c2paManifestStore"
      :fileCid="fileCid" />
  </div>
</template>
<script setup lang="ts">
import {
  type C2pa,
  type ManifestStore,
} from 'c2pa';
import Hash from 'ipfs-only-hash';

const props = defineProps<{
  c2pa: C2pa | null,
  src?: string,
}>()

const c2paValidationError = ref('')
const c2paManifestStore = ref<ManifestStore | null>(null)
const fileCid = ref('')
const videoPreview = ref<HTMLVideoElement | null>(null)

watch(() => props.src, (src: string | undefined) => {
  if (src) {
    videoPreview.value?.play()
    readURLAsBlob(src)
  }
})

onMounted(() => {
  if (props.src) {
    videoPreview.value?.play()
    readURLAsBlob(props.src)
  }
})

async function readURLAsBlob(url: string) {
  const { data, error } = await useFetch(url, {
    responseType: 'blob'
  });
  if (error.value) throw error.value
  const blob = data.value as Blob
  readC2pa(blob),
  fileCid.value = await Hash.of(new Uint8Array(await blob.arrayBuffer()), { cidVersion: 1, rawLeaves: true })
}

async function readFileCid(file: File) {
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const buffer = e.target?.result as ArrayBuffer
      fileCid.value = await Hash.of(new Uint8Array(buffer), { cidVersion: 1, rawLeaves: true })
    } catch (err) {
      console.error('Error reading file:', err)
    }
  }
  reader.readAsArrayBuffer(file)
}

async function readC2pa(file: File | Blob) {
  c2paManifestStore.value = null;
  const c2pa = props.c2pa;
  if (!c2pa) return;
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

async function onFileChange(event: Event) {
  c2paManifestStore.value = null;
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