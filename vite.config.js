import { env } from 'node:process'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: env.VITE_BASE_PATH
    ? `${env.VITE_BASE_PATH.replace(/\/?$/, '/')}`
    : '/',
  plugins: [react(), tailwindcss()],
})

