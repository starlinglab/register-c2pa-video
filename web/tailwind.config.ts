import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        'handwriting': '"Shadows Into Light", cursive',
        'mono': '"Kode Mono", monospace',
      }
    }
  }
}
