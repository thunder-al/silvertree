import {defineConfig, UserConfig} from 'vite'
import dts from 'vite-plugin-dts'
import checker from 'vite-plugin-checker'
import * as fs from 'node:fs/promises'


export default defineConfig(async () => {
  const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'))

  const packages = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]

  const externals = [
    /^node:/i,
  ]

  for (const pkg of packages) {
    externals.push(new RegExp(`^${pkg}(/.*)?$`, 'i'))
  }

  return <UserConfig>{
    build: {
      minify: false,
      sourcemap: true,
      lib: {
        entry: {
          index: './src/index.ts',
          standalone: './src/standalone.ts',
          silvertree: './src/silvertree/index.ts',
          'in-memory-driver': './src/drivers/InMemoryStorageDriver.ts',
          'filesystem-driver': './src/drivers/FilesystemStorageDriver.ts',
          's3-driver': './src/drivers/S3StorageDriver.ts',
        },
        formats: ['es', 'cjs'],
        name: 'index',
      },
      target: 'esnext',
      rollupOptions: {
        output: {
          sourcemapExcludeSources: true,
        },
        external: externals,
      },
    },
    esbuild: {
      minifyIdentifiers: false,
    },
    plugins: [
      dts({
        rollupTypes: true,
        compilerOptions: {removeComments: false, declaration: true},
        aliasesExclude: externals,
      }),
      //checker({typescript: true,}),
    ],
  }
})
