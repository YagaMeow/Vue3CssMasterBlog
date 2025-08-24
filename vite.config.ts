import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
// https://vite.dev/config/

const env = loadEnv('production', process.cwd())

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[name]',
      inject: 'body-last',
      customDomId: '__svg__icons__dom__',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
