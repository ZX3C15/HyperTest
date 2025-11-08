import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'), // adjust path as needed
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, './client/src/setupTests.ts'),
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
