import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public', // Change output directory to 'public'
    emptyOutDir: true, // Clear the output directory before building
  }
})