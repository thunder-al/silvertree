import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Module} from '../../module'
import {Container} from '../../container'
import {Inject} from '../../injection'

test('global module exports', async () => {

  // create a module with some globally exported value
  class Mod1Global extends Module {
    async setup() {
      this.bind.functional('global-key', () => 'some-global-value')
        .alias('global-key-alias')
        .export({withAliases: true, global: true})
    }
  }

  // create module, that exports alias of global module
  class Mod2 extends Module {
    async setup() {
      // no imports. should load from global bindings
      this.alias('global-key-alias', 'mod2-alias-of-global')
      this.export('mod2-alias-of-global')
    }
  }

  // create module, that imports Mod2 and uses its alias in service class
  class Mod3 extends Module {
    async setup() {
      await this.import(Mod2)
      this.bind.singletonClass(Mod3Service).export({global: true})
    }
  }

  class Mod3Service {
    // injecting alias of global module from imported Mod2
    @Inject('mod2-alias-of-global')
    protected readonly val!: string

    public getVal() {
      return this.val
    }
  }

  const container = await Container.make()
    .registerBatch([
      Mod1Global,
      Mod2,
      Mod3,
    ])

  const mod3Service = await container.provideAsync(Mod3Service)

  expect(mod3Service.getVal()).toBe('some-global-value')
})
