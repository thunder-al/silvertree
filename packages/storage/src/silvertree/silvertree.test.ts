import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module} from '@silvertree/core'
import {StorageRootModule} from './StorageRootModule'
import {InjectDisc} from './decorators'
import {StorageDriver} from '../StorageDriver'

test('silvertree integration', async () => {

  class MySvc {
    @InjectDisc('test')
    protected readonly disc!: StorageDriver

    public async addFile() {
      await this.disc.put('test.txt', 'test')
    }

    public async getFile() {
      return await this.disc.get('test.txt')
    }
  }

  class MyModule extends Module {
    async setup() {
      this.bind.singletonClass(MySvc)
        .export({global: true})
    }
  }

  const c = await Container.make()
    .registerBatch([
      StorageRootModule.configure()
        .configureDisk('test', 'memory', null),
      MyModule,
    ])

  const svc = await c.provideAsync(MySvc)
  await svc.addFile()

  expect(await svc.getFile()).toBe('test')

})
