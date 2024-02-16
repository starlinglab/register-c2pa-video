declare module "ipfs-only-hash" {
  export function of (
    content: string | Uint8Array | AsyncIterable<Uint8Array>,
    options?: any,
  ): Promise<string>
}
