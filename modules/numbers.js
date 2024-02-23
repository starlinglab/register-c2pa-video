import axios from 'axios';
import FormData from 'form-data';
import { NUMBER_CAPTURE_TOKEN } from '../config.js';

const numAPI = axios.create({
  baseURL: 'https://api.numbersprotocol.io/api/v3',
  headers: {
    'Authorization': `token ${NUMBER_CAPTURE_TOKEN}`,
  },
});

export async function registerNUMAsset(fileBuffer, filename, {
  caption = '',
  format = '',
  information = [],
  parentAssetCid,
} = {}) {
  try {
    const formData = new FormData();
    formData.append('asset_file', fileBuffer, filename);
    formData.append('meta', JSON.stringify({
      proof: {
        hash: '',
        mimeType: format || '',
        timestamp: '',
      },
    }));
    formData.append('caption', caption);
    if (parentAssetCid) {
      formData.append('nit_commit_custom', JSON.stringify({
        parentAssetCid,
      }));
    }
    if (information?.length) {
      formData.append('information', JSON.stringify(information));
    }
    const result = await numAPI.post('/assets/', formData, {
      headers: formData.getHeaders(),
    })
    const { id } = result.data
    return id
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const numError = error.response?.data?.error
      if (numError) {
        if (numError.type === 'duplicate_asset_not_allowed') {
          const assetId = numError.details[0]?.cid
          if (assetId) {
            return assetId
          }
        } else {
          // eslint-disable-next-line no-console
          console.error(numError)
        }
      }
    }
    // eslint-disable-next-line no-console
    console.error(error)
    throw new Error("REGISTER_NUM_ASSET_FAILED")
  }
}

export async function queryNumbersAsset(cid) {
  const res = await numAPI.get(`/assets/${cid}`);
  return res.data;
}
