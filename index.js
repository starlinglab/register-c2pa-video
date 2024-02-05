import path from 'path';
import { fileTypeFromBuffer}  from 'file-type';

import { readFile } from './modules/file.js';
import { getC2PaManifest } from './modules/c2pa.js';
import { registerNUMAsset, queryNumbersAsset } from './modules/numbers.js';
import { transcodeVideo, waitUntilTaskIsDone, parseMp4PathFromTask } from './modules/livepeer.js';
import { getFile } from './modules/storj.js';

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
      // information: activeManifest.assertions,
    }
  );
  console.log(cid);
  const numberAsset = await queryNumbersAsset(cid);
  const taskId = await transcodeVideo(fileName, numberAsset.asset_file, 'test-bucket')
  console.log(taskId);
  const task = await(waitUntilTaskIsDone(taskId));
  console.log(task);
  const taskOutputData = parseMp4PathFromTask(task);
  if (!taskOutputData) {
    throw new Error('LIVEPEER_TRANSCODED_VIDEO_NOT_FOUND');
  }
  const { bucket, fileName: transcodedFileName } = taskOutputData;
  const transcodedBuffer = await getFile(bucket, transcodedFileName);
  const childCid = await registerNUMAsset(
    transcodedBuffer,
    path.basename(transcodedFileName),
    {
      caption: activeManifest.title,
      format: (await fileTypeFromBuffer(transcodedBuffer)).mime,
      parentAssetCid: cid,
      // information: activeManifest.assertions,
    }
  );
  console.log(childCid)
}

main(process.argv[2])
