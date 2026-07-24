import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    // The in-memory MongoDB binary can take a moment to download/boot.
    hookTimeout: 120000,
    testTimeout: 30000,
    // Each test file boots its own in-memory Mongo, so keep files sequential
    // to avoid spawning many servers at once.
    fileParallelism: false,
  },
});
