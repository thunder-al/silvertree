import {expect, test} from 'vitest'
import {Module} from '../Module'
import {Container} from '../../container/Container'

test('modules export export', async () => {

  class Mod1 extends Module {
    async setup() {
      this.bind.functional('exported-mod1', () => 'exported-mod1-value')
        .export()
    }
  }

  // import value from Mod1 and export it as is
  class Mod2 extends Module {
    async setup() {
      await this.import(Mod1)
      this.export('exported-mod1')
    }
  }

  // import value from Mod2 and export it as exported-mod1-alias
  class Mod3 extends Module {
    async setup() {
      await this.import(Mod2)
      this.alias('exported-mod1', 'exported-mod1-alias')
      this.export('exported-mod1-alias')
    }
  }

  const c = new Container()
  await c.register(Mod2)
  await c.register(Mod3)

  const mod2 = c.getModule(Mod2)
  const mod3 = c.getModule(Mod3)

  expect(await mod2.provideAsync('exported-mod1')).toBe('exported-mod1-value')
  expect(await mod3.provideAsync('exported-mod1-alias')).toBe('exported-mod1-value')

})
