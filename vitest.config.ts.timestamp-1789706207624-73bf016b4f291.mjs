// vitest.config.ts
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { mergeConfig, defineConfig as defineConfig2, configDefaults } from "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/node_modules/vitest/dist/config.js";

// vite.config.ts
import { fileURLToPath, URL as URL2 } from "node:url";
import { defineConfig, loadEnv } from "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import vueDevTools from "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import { createSvgIconsPlugin } from "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import path from "path";
var __vite_injected_original_import_meta_url = "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/vite.config.ts";
var env = loadEnv("production", process.cwd());
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[name]",
      inject: "body-last",
      customDomId: "__svg__icons__dom__"
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL2("./src", __vite_injected_original_import_meta_url))
    }
  }
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
});

// vitest.config.ts
var __vite_injected_original_import_meta_url2 = "file:///C:/Users/18504/Documents/CSSMaster/blog/Vue3CssMasterBlog/vitest.config.ts";
var vitest_config_default = mergeConfig(
  vite_config_default,
  defineConfig2({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/**"],
      root: fileURLToPath2(new URL("./", __vite_injected_original_import_meta_url2))
    }
  })
);
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyIsICJ2aXRlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXDE4NTA0XFxcXERvY3VtZW50c1xcXFxDU1NNYXN0ZXJcXFxcYmxvZ1xcXFxWdWUzQ3NzTWFzdGVyQmxvZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcMTg1MDRcXFxcRG9jdW1lbnRzXFxcXENTU01hc3RlclxcXFxibG9nXFxcXFZ1ZTNDc3NNYXN0ZXJCbG9nXFxcXHZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzLzE4NTA0L0RvY3VtZW50cy9DU1NNYXN0ZXIvYmxvZy9WdWUzQ3NzTWFzdGVyQmxvZy92aXRlc3QuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJ1xuaW1wb3J0IHsgbWVyZ2VDb25maWcsIGRlZmluZUNvbmZpZywgY29uZmlnRGVmYXVsdHMgfSBmcm9tICd2aXRlc3QvY29uZmlnJ1xuaW1wb3J0IHZpdGVDb25maWcgZnJvbSAnLi92aXRlLmNvbmZpZydcblxuZXhwb3J0IGRlZmF1bHQgbWVyZ2VDb25maWcoXG4gIHZpdGVDb25maWcsXG4gIGRlZmluZUNvbmZpZyh7XG4gICAgdGVzdDoge1xuICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgICBleGNsdWRlOiBbLi4uY29uZmlnRGVmYXVsdHMuZXhjbHVkZSwgJ2UyZS8qKiddLFxuICAgICAgcm9vdDogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuLycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0pLFxuKVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFwxODUwNFxcXFxEb2N1bWVudHNcXFxcQ1NTTWFzdGVyXFxcXGJsb2dcXFxcVnVlM0Nzc01hc3RlckJsb2dcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXDE4NTA0XFxcXERvY3VtZW50c1xcXFxDU1NNYXN0ZXJcXFxcYmxvZ1xcXFxWdWUzQ3NzTWFzdGVyQmxvZ1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvMTg1MDQvRG9jdW1lbnRzL0NTU01hc3Rlci9ibG9nL1Z1ZTNDc3NNYXN0ZXJCbG9nL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5pbXBvcnQgeyBjcmVhdGVTdmdJY29uc1BsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cblxuY29uc3QgZW52ID0gbG9hZEVudigncHJvZHVjdGlvbicsIHByb2Nlc3MuY3dkKCkpXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICB2dWVKc3goKSxcbiAgICB2dWVEZXZUb29scygpLFxuICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcbiAgICAgIGljb25EaXJzOiBbcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL2ljb25zJyldLFxuICAgICAgc3ltYm9sSWQ6ICdpY29uLVtuYW1lXScsXG4gICAgICBpbmplY3Q6ICdib2R5LWxhc3QnLFxuICAgICAgY3VzdG9tRG9tSWQ6ICdfX3N2Z19faWNvbnNfX2RvbV9fJyxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICB9LFxuICB9LFxuICAvLyBzZXJ2ZXI6IHtcbiAgLy8gICBvcGVuOiB0cnVlLFxuICAvLyAgIHBvcnQ6IHBhcnNlSW50KGVudi5WSVRFX0NMSV9QT1JUKSxcbiAgLy8gICBwcm94eToge1xuICAvLyAgICAgW2Vudi5WSVRFX0JBU0VfQVBJXToge1xuICAvLyAgICAgICB0YXJnZXQ6IGAke2Vudi5WSVRFX0JBU0VfUEFUSH06JHtlbnYuVklURV9TRVJWRVJfUE9SVH1gLFxuICAvLyAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gIC8vICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+XG4gIC8vICAgICAgICAgcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoJ14nICsgZW52LlZJVEVfQkFTRV9BUEkpLCAnJylcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStXLFNBQVMsaUJBQUFBLHNCQUFxQjtBQUM3WSxTQUFTLGFBQWEsZ0JBQUFDLGVBQWMsc0JBQXNCOzs7QUNEaVQsU0FBUyxlQUFlLE9BQUFDLFlBQVc7QUFFOVksU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLDRCQUE0QjtBQUNyQyxPQUFPLFVBQVU7QUFQc04sSUFBTSwyQ0FBMkM7QUFVeFIsSUFBTSxNQUFNLFFBQVEsY0FBYyxRQUFRLElBQUksQ0FBQztBQUUvQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxZQUFZO0FBQUEsSUFDWixxQkFBcUI7QUFBQSxNQUNuQixVQUFVLENBQUMsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLGtCQUFrQixDQUFDO0FBQUEsTUFDMUQsVUFBVTtBQUFBLE1BQ1YsUUFBUTtBQUFBLE1BQ1IsYUFBYTtBQUFBLElBQ2YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJQyxLQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWFGLENBQUM7OztBRHpDd08sSUFBTUMsNENBQTJDO0FBSTFSLElBQU8sd0JBQVE7QUFBQSxFQUNiO0FBQUEsRUFDQUMsY0FBYTtBQUFBLElBQ1gsTUFBTTtBQUFBLE1BQ0osYUFBYTtBQUFBLE1BQ2IsU0FBUyxDQUFDLEdBQUcsZUFBZSxTQUFTLFFBQVE7QUFBQSxNQUM3QyxNQUFNQyxlQUFjLElBQUksSUFBSSxNQUFNRix5Q0FBZSxDQUFDO0FBQUEsSUFDcEQ7QUFBQSxFQUNGLENBQUM7QUFDSDsiLAogICJuYW1lcyI6IFsiZmlsZVVSTFRvUGF0aCIsICJkZWZpbmVDb25maWciLCAiVVJMIiwgIlVSTCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImRlZmluZUNvbmZpZyIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
