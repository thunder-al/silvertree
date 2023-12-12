import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module} from '@silvertree/core'
import {LoggerRootModule} from '../logger-root-module'
import {Logger} from 'winston'
import {InjectLogger} from '../decorators'
import {LoggerModule} from '../logger-module'
import {getLocalLoggerInjectKey} from '../util'

test('logger', async () => {

  class TestModule extends Module {
    public async setup() {
      await this.import([
        LoggerModule,
      ])

      this.export(getLocalLoggerInjectKey())
      this.exportGlobal(getLocalLoggerInjectKey())

      this.bind.syncSingletonClass(TestService).export({global: true})

      const logger = this.provideSync<Logger>(getLocalLoggerInjectKey())
      logger.info('hello from setup')
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

  // same logger, but from container
  const childLogger2 = c.provideSync<Logger>(getLocalLoggerInjectKey())
  expect(childLogger2).instanceOf(Logger)
  childLogger2.info('child logger2')
})
