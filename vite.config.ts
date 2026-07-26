import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        planning: resolve(rootDirectory, 'planning-lab.html'),
      },
    },
  },
})
