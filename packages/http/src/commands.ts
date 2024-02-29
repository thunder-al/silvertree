import {Module} from '@silvertree/core'
import type {CliRootService} from '@silvertree/cli'
import {HttpRootService} from './HttpRootService'

export async function attachHttpCommands(
  module: Module<any>,
  scope: boolean | string = 'default',
) {
  const scopeStr = typeof scope === 'boolean' ? 'default' : scope

  const cliModule = await import('@silvertree/cli')
  const cli = module.provideSync<CliRootService>(cliModule.getRootCliServiceInjectKey(scopeStr))

  const cliSuffix = scopeStr === 'default' ? '' : `-${scopeStr}`

  // noinspection TypeScriptValidateJSTypes
  cli.registerCommand({
    name: `http${cliSuffix} start`,
    description: 'Start the HTTP server' + (scopeStr === 'default' ? '' : ` (scope ${scopeStr})`),
    arguments: [],
    options: [],
    async action() {
      const svc = module.provideSync(HttpRootService)
      await svc.startHttpServer()
    },
  })
}
