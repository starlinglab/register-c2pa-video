import path from 'path';
import { readFile } from './modules/file.js';
import { getC2PaManifest } from './modules/c2pa.js';
import { registerNUMAsset } from './modules/numbers.js';

async function main(filePath) {
  const { buffer, mimeType } = await readFile(filePath);
  const manifest = await getC2PaManifest({ buffer, mimeType });
  const activeManifest = manifest.active_manifest;
  console.log(JSON.stringify(manifest))
  const cid = await registerNUMAsset(
    buffer,
    path.basename(filePath),
    {
      caption: activeManifest.title,
      format: mimeType,
      information: activeManifest.assertions,
    }
  )
  console.log(cid)
}

main(process.argv[2])
