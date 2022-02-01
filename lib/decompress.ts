import { strFromU8, unzlibSync, strToU8 } from 'fflate'

export function decompress({
  encoded,
  size
}: {
  encoded: string
  size: number
}) {
  const decodedBuffer = new Uint8Array(size)
  const decoded = strFromU8(unzlibSync(strToU8(encoded, true), decodedBuffer))

  return JSON.parse(decoded)
}
