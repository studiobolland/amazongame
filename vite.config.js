import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Use the subfolder for GitHub Pages build, but root for local dev
    base: command === 'build' ? '/amazongame/' : '/',
  }
})