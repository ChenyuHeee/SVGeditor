import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 如果部署到 GitHub Pages 且仓库名为 'svg-editor'，则 base 设为 '/svg-editor/'
// 如果是自定义域名或用户名下的顶级仓库，则 base 设为 '/'
export default defineConfig({
  plugins: [vue()],
  base: '/SVGeditor/',
  server: {
    port: 3000
  }
})