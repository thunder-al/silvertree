import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module} from '@silvertree/core'
import {getRunnerCliServiceInjectKey, runCli} from '../util'
import {CliRootModule} from '../CliRootModule'
import {CliRunnerService} from '../CliRunnerService'
import {CliModule} from '../CliModule'
import {CLiArgument, CliCommand} from '../decorators'


test('command line plain', async () => {
  let triggered = 0

  class AppModule extends Module {
    async setup() {
      const reg = this.container.provideSync<CliRunnerService>(getRunnerCliServiceInjectKey())
      reg.registerCommand({
        name: 'test-inline',
        action: () => {
          triggered++
        },
      })
    }
  }

  const c = await Container.make().registerBatch([
    CliRootModule.configured({}),
    AppModule,
  ])

  await runCli(c, 'default', ['', '', 'test-inline'])

  expect(triggered).toBe(1)
})

test('cli class command target', async () => {
  let triggered = 0

  class CommandHandler {

    @CliCommand({name: 'sub1 sub2 test'})
    protected test(
      @CLiArgument({name: 'arg1'})
        arg1: string,
      @CLiArgument({name: 'arg2'})
        arg2: string,
    ) {
      expect(arg1).toBe('arg1')
      expect(arg2).toBe('arg2')

      triggered++
    }
  }

  class AppModule extends Module {
    async setup() {
      await this.import([
        CliModule.configured({
          handlers: [CommandHandler],
        }),
      ])
    }
  }

  const c = await Container.make().registerBatch([
    CliRootModule.configured({}),
    AppModule,
  ])

  await runCli(c, 'default', ['', '', 'sub1', 'sub2', 'test', 'arg1', 'arg2'])

  expect(triggered).toBe(1)
})

