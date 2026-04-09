import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPwaNavigateFallbackAllowlist } from './src/router/pwaAllowlist.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// src/views 아래의 각 디렉터리 index.vue → pathname Set ('/' 포함). (config 번들에 import.meta.glob 없음)
function collectSpaRoutePathsFromViewsDir(viewsRoot) {
  const set = new Set(['/']);
  function walk(currentDir, segments) {
    const entries = readdirSync(currentDir, { withFileTypes: true });
    for (const ent of entries) {
      const full = join(currentDir, ent.name);
      if (ent.isDirectory()) {
        walk(full, [...segments, ent.name]);
      } else if (ent.name === 'index.vue') {
        const path = segments.length ? `/${segments.join('/')}` : '/';
        set.add(path.replaceAll('//', '/'));
      }
    }
  }
  walk(viewsRoot, []);
  return set;
}

const spaPathSetForPwa = collectSpaRoutePathsFromViewsDir(resolve(__dirname, 'src/views'));

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      filename: 'sw.js',
      manifestFilename: 'manifest.json',
      includeAssets: [
        'icons/**/*.png',
        'browserconfig.xml',
        'imgs/unnamed/board.png',
        'imgs/unnamed/man.png',
      ],
      manifest: {
        name: 'explainpark101 Apps',
        short_name: 'explainpark101',
        description: '다양한 유틸리티 앱 모음',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f5f5f5',
        theme_color: '#1976D2',
        orientation: 'portrait-primary',
        lang: 'ko',
        dir: 'ltr',
        categories: ['utilities', 'productivity'],
        icons: [
          { src: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest,json}'],
        navigateFallback: 'index.html',
        // SPA 라우트 경로에 대해서만 navigateFallback이 적용되도록 합니다.
        navigateFallbackAllowlist: buildPwaNavigateFallbackAllowlist(spaPathSetForPwa),
      },
    }),
  ],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  base: '/',
  root: '.',
  outputDir: 'dist',
  publicPath: '/',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    open: true,
  },
});
