import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Reuses the app's own vite config so the `@` alias and the Vue plugin behave in tests
// exactly as they do in the build — a second, hand-maintained alias list would drift.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.ts'],
    },
  }),
);
