import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueRouter from 'vue-router'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueRouter()],
})
