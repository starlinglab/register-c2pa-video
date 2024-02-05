import S3 from 'aws-sdk/clients/s3.js';
import {
  STORJ_ACCESS_KEY_ID,
  STORJ_ACCESS_KEY_SECRET,
} from '../config.js';

let client = null;

function getNewS3Client() {
  if (!client) {
    client = new S3({
      endpoint: 'https://gateway.storjshare.io',
      "credentials": {
        "accessKeyId": STORJ_ACCESS_KEY_ID,
        "secretAccessKey": STORJ_ACCESS_KEY_SECRET,
      }
    });
  }
  return client;
}

export async function uploadFile(bucket, path, fileBuffer) {
  const s3 = getNewS3Client();
  const res = await s3.uploadObject({
    Bucket: bucket,
    Key: path,
    Body: fileBuffer,
  }).promise();
  return res;
}

export async function getFile(bucket, path) {
  const s3 = getNewS3Client();
  const res = await s3.getObject({
    Bucket: bucket,
    Key: path,
  }).promise();
  return res.Body;
}
