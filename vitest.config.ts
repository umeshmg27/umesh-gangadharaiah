import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      clearMocks: true,
      css: true,
      environment: 'jsdom',
      globals: true,
      restoreMocks: true,
      setupFiles: './src/test/setup.ts',
    },
  }),
);
