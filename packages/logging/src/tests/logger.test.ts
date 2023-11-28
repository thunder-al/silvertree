import {expect, test} from 'vitest'
import {Container, Module} from '@silvertree/core'
import {LoggerRootModule} from '../logger-root-module'
import {Logger} from 'winston'
import {InjectLogger} from '../decorators'
import {LoggerModule} from '../logger-module'

test('logger', async () => {

  class TestModule extends Module {
    public async setup() {
      await this.import([
        LoggerModule,
      ])

      this.bind.syncSingletonClass(TestService).export({global: true})
    }
  }

  class TestService {
    @InjectLogger()
    public logger!: Logger
  }

  const c = await Container.make().registerBatch([
    LoggerRootModule,
    TestModule,
  ])

  const rootLogger = c.provideSync<Logger>('logger:root:default')
  expect(rootLogger).instanceOf(Logger)
  rootLogger.info('root logger')

  const testMod = c.getModule(TestModule)
  const testService = testMod.provideSync<TestService>(TestService)
  const childLogger = testService.logger
  expect(childLogger).instanceOf(Logger)
  childLogger.info('child logger')
})
