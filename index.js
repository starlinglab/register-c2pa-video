import path from 'path';
import { readFile } from './modules/file.js';
import { getC2PaManifest } from './modules/c2pa.js';
import { registerNUMAsset, queryNumbersAsset } from './modules/numbers.js';
import { transcodeVideo, waitUntilTaskIsDone } from './modules/livepeer.js';

async function main(filePath) {
  const { buffer, mimeType } = await readFile(filePath);
  const manifest = await getC2PaManifest({ buffer, mimeType });
  const activeManifest = manifest.active_manifest;
  console.log(JSON.stringify(manifest));
  const fileName = path.basename(filePath);
  const cid = await registerNUMAsset(
    buffer,
    fileName,
    {
      caption: activeManifest.title,
      format: mimeType,
      information: activeManifest.assertions,
    }
  );
  console.log(cid);
  const numberAsset = await queryNumbersAsset(cid);
  const taskId = await transcodeVideo(fileName, numberAsset.asset_file, 'test-bucket')
  console.log(taskId);
  const task = await(waitUntilTaskIsDone(taskId));
  console.log(task);
}

main(process.argv[2])
