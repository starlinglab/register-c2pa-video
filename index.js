import { createC2pa } from 'c2pa-node';

async function main(filePath) {
  const c2pa = await createC2pa()
  const res = await c2pa.read({ path: filePath })
  console.log(res)
}

main(process.argv[2])
