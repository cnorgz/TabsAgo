import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup/chrome.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  }
})


