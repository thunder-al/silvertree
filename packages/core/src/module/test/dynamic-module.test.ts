import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Module} from '../Module'
import {configureModule} from '../../util/keys'
import {Container} from '../../container'
import {Inject} from '../../injection'
import {DynamicModule} from '../DynamicModule'

test('dynamic module', async () => {

  class DynMod extends DynamicModule<{ key: string, value: any }> {
    async setup(): Promise<void> {
      this.bind.constant(this.config?.key!, this.config?.value).export()
    }
  }

  class Mod1 extends Module {
    async setup(): Promise<void> {
      await this.import([
        configureModule(DynMod, () => ({key: 'key1', value: 'value1'})),
      ])

      this.bind.singletonClass(Svc1)
    }
  }

  class Svc1 {
    @Inject('key1')
    public readonly key1!: string

    @Inject('key2')
    public readonly key2!: string
  }

  const c = await Container.make().registerBatch([
    Mod1,
    configureModule(DynMod, () => ({key: 'key2', value: 'value2'})),
  ])

  const mod1 = c.getModule(Mod1)
  const svc1 = await mod1.provideAsync(Svc1)

  expect(svc1.key1).toBe('value1')
  expect(svc1.key2).toBe('value2')
})
