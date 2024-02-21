import path from 'path';
import axios from 'axios';
import {
  LIVEPEER_API_KEY,
  STORJ_ACCESS_KEY_ID,
  STORJ_ACCESS_KEY_SECRET,
} from '../config.js';

const livepeerAPI = axios.create({
  baseURL: 'https://livepeer.studio/api',
  timeout: 60000,
  headers: {
    'Authorization': `Bearer ${LIVEPEER_API_KEY}`,
  },
});

export async function transcodeVideo(fileName, { bucket: inputBucket, path: inputPath }, { bucket: outputBucket }) {
  try {
    const result = await livepeerAPI.post('/transcode', {
      c2pa: true,
      input: {
        "type": "s3",
        "endpoint": "https://gateway.storjshare.io",
        "bucket": inputBucket,
        "path": inputPath,
        "credentials": {
          "accessKeyId": STORJ_ACCESS_KEY_ID,
          "secretAccessKey": STORJ_ACCESS_KEY_SECRET,
        }
      },
      "storage": {
        "type": "s3",
        "endpoint": "https://gateway.storjshare.io",
        "bucket": outputBucket,
        "credentials": {
          "accessKeyId": STORJ_ACCESS_KEY_ID,
          "secretAccessKey": STORJ_ACCESS_KEY_SECRET,
        }
      },
      "outputs": {
        "mp4": {
          "path": `/${fileName}/mp4`
        },
      },
      "profiles": [
        {
          "name": path.parse(fileName).name,
          "bitrate": 6000000,
          "profile": "H264Baseline",
        }
      ],
    })
    const { id } = result.data
    return id
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    throw new Error('LIVEPEER_TRANSCODE_TASK_FAILED');
  }
}

export async function getTask(taskId) {
  const result = await livepeerAPI.get(`/task/${taskId}`);
  return result.data;
}

export async function waitUntilTaskIsDone(taskId) {
  // keep querying api per 5 seconds until task is done
  let task = await getTask(taskId);
  while (task?.status?.phase !== 'completed') {
    if (task?.status?.phase === 'failed') throw new Error(task.status.errorMessage);
    console.log(`Task ${taskId} is still running ${task?.status?.progress || ''}... retries ${task?.status?.retries}`)
    await new Promise((resolve) => setTimeout(resolve, 5000));
    task = await getTask(taskId);
  }
  return task;
}

export function parseMp4PathFromTask(task) {
  if (task.type !== 'transcode-file') {
    throw new Error('INVALID_TASK_TYPE');
  }
  const transcodeConfig = task.params['transcode-file'];
  if (!transcodeConfig) {
    throw new Error('INVALID_TASK_PARAMS');
  }
  const folderPath = transcodeConfig.outputs.mp4?.path;
  const bucket = transcodeConfig.storage?.url.split('/').pop();
  const fileName = `${transcodeConfig.profiles[0].name}.mp4`;
  if (!bucket || !folderPath) {
    return null;
  }
  return {
    bucket,
    fileName: `${folderPath}/${fileName}`
  }
}
