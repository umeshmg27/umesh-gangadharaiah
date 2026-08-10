import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/umesh-gangadharaiah/',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
