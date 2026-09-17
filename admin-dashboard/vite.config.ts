import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 核心和路由拆为独立 chunk
          'vue-core': ['vue', 'vue-router', 'pinia'],
          // 将 Naive UI 拆为独立 chunk（体积较大）
          'naive-ui': ['naive-ui'],
          // 图标库单独拆分
          icons: ['@vicons/ionicons5'],
          // 图表库单独拆分
          charts: ['echarts', 'vue-echarts'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  server: {
    port: 9527,
    // 百炼知识库代理服务（server/bailian_knowledge.py），前端不直连 OpenAPI
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9610',
        changeOrigin: true,
      },
    },
    fs: {
      strict: false,
    },
  },
})
