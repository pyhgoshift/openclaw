import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['app/api/src/**/*.test.ts', 'app/test/**/*.test.ts'],
    exclude: ['app/web/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['app/web/**', 'node_modules/**', '**/*.test.ts'],
    },
  },
})
