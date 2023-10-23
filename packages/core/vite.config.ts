import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import nodeExternals from 'rollup-plugin-node-externals'
import checker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [qwe() as any],
})

function qwe() {
  return {
    name: 'test',
    config: () => ({
      base: './',
      build: {
        minify: process.env.NODE_ENV === 'production',
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
        minifyIdentifiers: false,
      },
      plugins: [
        dts({rollupTypes: true}),
        checker({typescript: {buildMode: true}}),
      ],
    }),
  }
}
