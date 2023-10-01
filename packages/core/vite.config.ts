import {defineConfig, UserConfig} from 'vite'
import dts from 'vite-plugin-dts'
import nodeExternals from 'rollup-plugin-node-externals'
import checker from 'vite-plugin-checker'

export default defineConfig({
  base: './',
  build: {
    minify: process.env.MODE === 'production',
    sourcemap: true,
    lib: {
      entry: {index: './src/index.ts'},
      formats: ['es', 'cjs', 'umd'],
      name: 'index',
    },
    target: 'esnext',
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true,
      },
      plugins: [
        nodeExternals(),
      ],
    },
  },
  esbuild: {
    keepNames: true,
  },
  plugins: [
    dts({rollupTypes: true}),
    checker({typescript: {buildMode: false}}),
  ],
})
