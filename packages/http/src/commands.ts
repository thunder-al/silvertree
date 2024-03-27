import {bindingKeyToString, getModuleName, Module} from '@silvertree/core'
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

  cli.registerCommand({
    name: `http${cliSuffix} routes`,
    description: 'List all registered routes' + (scopeStr === 'default' ? '' : ` (scope ${scopeStr})`),
    arguments: [],
    options: [],
    async action() {
      const svc = module.provideSync(HttpRootService)
      const routes = svc.getRoutes()

      // using str.length to get the correct padding
      const paddings = [
        'function'.length, // type
        'post,delete'.length, // method
        35, // url
        35, // source
      ]

      console.log(
        'TYPE'.padEnd(paddings[0])
        + ' '
        + 'METHOD'.padEnd(paddings[1])
        + ' '
        + 'URL'.padEnd(paddings[2])
        + ' '
        + 'SOURCE',
      )

      console.log('-'.repeat(paddings.reduce((a, b) => a + b + 1, 0) + paddings.length - 1))

      for (const route of routes) {
        if (route.type === 'route') {
          console.log(
            route.type.padEnd(paddings[0])
            + ' '
            + (Array.isArray(route.method) ? route.method.join(',') : route.method).toUpperCase().padEnd(paddings[1])
            + ' '
            + route.url.padEnd(paddings[2])
            + ' '
            + `${bindingKeyToString(route.controller)}.${route.controllerFunctionName} [${getModuleName(route.module)}]`.padEnd(paddings[3]),
          )
        } else if (route.type === 'function') {
          console.log(
            route.type.padEnd(paddings[0])
            + ' '
            + ''.padEnd(paddings[1])
            + ' '
            + ''.padEnd(paddings[2])
            + ' '
            + `${bindingKeyToString(route.controller)}.${route.controllerFunctionName} [${getModuleName(route.module)}]`.padEnd(paddings[3]),
          )
        }
      }
    },
  })
}
