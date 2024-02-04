import { fileTypeFromBuffer}  from 'file-type';
import fs from 'fs';

export async function readFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const { mime } = await fileTypeFromBuffer(buffer);
  return { buffer, mimeType: mime };
}
