import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  base: '/suunnistus/',
  server: {
    host: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
