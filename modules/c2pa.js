import { createC2pa } from 'c2pa-node';

let c2paInstance = null;

async function getC2Pa() {
  if (!c2paInstance) c2paInstance = await createC2pa();
  return c2paInstance;
}

export async function getC2PaManifest({ buffer, mimeType }) {
  const c2pa = await getC2Pa();
  const res = await c2pa.read({ buffer, mimeType });
  return res;
}