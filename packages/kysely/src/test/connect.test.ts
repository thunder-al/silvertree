import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module} from '@silvertree/core'
import {InjectKysely} from '../decorators'
import {KyselyGlobal} from '../types'
import {KyselyRootModule} from '../KyselyRootModule'
import * as kysely from 'kysely'
import {LoggerRootModule} from '@silvertree/logging'

test('connect', async () => {

  class AppService {
    @InjectKysely()
    protected db!: KyselyGlobal

    async test() {
      return await kysely.sql`SELECT 'ok' as "test"`.execute(this.db)
    }
  }

  class AppModule extends Module {
    async setup() {
      this.bind.singletonClass(AppService).export({global: true})
    }
  }

  const c = await Container.make().registerBatch([
    LoggerRootModule,
    KyselyRootModule.configuredFromEnv({
      modify: (container, parentMod, config) => {
        return {
          ...config,
          dialect: 'postgres',
          url: config?.url ?? 'postgres://postgres:postgres@localhost:5432/postgres',
          attachCommands: false,
        }
      },
    }),
    AppModule,
  ])

  const app = await c.provideAsync(AppService)

  expect(await app.test()).toEqual({rows: [{test: 'ok'}]})
})
