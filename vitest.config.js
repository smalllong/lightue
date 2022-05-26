import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      lightue: resolve('lightue.js')
    }
  },
  test: {
    environment: 'jsdom'
  }
})
