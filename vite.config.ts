import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/

const env = loadEnv('development',process.cwd())

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
  // server: {
  //   open: true,
  //   port: parseInt(env.VITE_CLI_PORT),
  //   proxy: {
  //     [env.VITE_BASE_API]: {
  //       target: `${env.VITE_BASE_PATH}:${env.VITE_SERVER_PORT}`,
  //       changeOrigin: true,
  //       rewrite: (path: string) =>
  //         path.replace(new RegExp('^' + env.VITE_BASE_API), '')
  //     }
  //   }
  // }
})
