import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()] as PluginOption[],
  resolve: {
    alias: {
      'react-spreadsheet-mapper': path.resolve(__dirname, '../../packages/spreadsheet-mapper'),
    },
  },
})
