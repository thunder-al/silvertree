import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module} from '@silvertree/core'
import {CliModule} from '../CliModule'
import {CliRootModule} from '../CliRootModule'
import {runCli} from '../util'
import {CLiArgument, CliCommand, CLiOption} from '../decorators'
import {CliRootService} from '../CliRootService'

test('command', async () => {

  class CommandHandler {

    @CliCommand({name: 'test1', description: 'test1 description'})
    protected async test1(
      @CLiOption({name: 'opt2', description: 'opt2 description'})
        opt2: string,
      @CLiArgument({name: 'arg2', position: 1, description: 'arg2 description'})
        arg1: string,
      @CLiOption({name: 'opt1', shortName: '1', description: 'opt1 description'})
        opt1: string,
      @CLiArgument({name: 'arg1', position: 0, description: 'arg1 description'})
        arg0: string,
    ) {
      expect(arg0).toBe('arg0data')
      expect(arg1).toBe('arg1data')
      expect(opt1).toBe('opt1data')
      expect(opt2).toBe('opt2data')
    }
  }

  class MyModule extends Module {

    public async setup() {
      await this.import([
        CliModule.configured({
          handlers: [
            CommandHandler,
          ],
        }),
      ])
    }
  }

  const c = await Container.make().registerBatch([
    CliRootModule,
    MyModule,
  ])

  expect.assertions(4)
  await runCli(c, 'default', {argv: ['test1', 'arg0data', 'arg1data', '--opt1', 'opt1data', '--opt2', 'opt2data']})

  c.getModule(CliRootModule).provideSync(CliRootService).printHelp()
})
