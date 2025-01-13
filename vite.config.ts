import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { trace } from 'node:console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    open: true,
    port: parseInt(process.env.VITE_CLI_PORT as string),
    proxy: {
      [process.env.VITE_BASE_API as string]: {
        target: `${process.env.VITE_BASE_PATH}:${process.env.VITE_SERVER_PORT}/`,
        changeOrigin: true,
        rewrite: (path: string) =>
          path.replace(new RegExp('^' + process.env.VITE_BASE_API), '')
      }
    }
  }
})
