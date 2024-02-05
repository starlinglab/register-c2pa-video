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

export async function transcodeVideo(fileName, fileUrl, outputBucket) {
  try {
    const result = await livepeerAPI.post('/transcode', {
      c2pa: true,
      input: {
        "url": fileUrl,
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
        "hls": {
          "path": `/${fileName}/hls`
        },
        "mp4": {
          "path": `/${fileName}/mp4`
        },
        "fmp4": {
          "path": `/${fileName}/fmp4`
        }
      },
      "profiles": [
        {
          "name": "720p",
          "bitrate": 1000,
          "profile": "H264Baseline",
          "encoder": "h264"
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
    console.log(`Task ${taskId} is still running... retries ${task?.status?.retries}`)
    await new Promise((resolve) => setTimeout(resolve, 5000));
    task = await getTask(taskId);
  }
  return task;
}
