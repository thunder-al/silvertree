import {Container} from '@silvertree/core'
import {CliRootService} from './CliRootService'
import {ICliArgv} from './types'

export function getRootCliServiceInjectKey(scope?: string): string {
  return `cli:root:${scope ?? 'default'}`
}

export function getRunnerCliServiceInjectKey(scope?: string): string {
  return `cli:runner:${scope ?? 'default'}`
}

/**
 * Run the CLI from the given container
 */
export async function runCli(
  container: Container,
  scope?: string,
  options?: {
    argv?: Array<string>,
  },
) {
  const cliService = await container.provideAsync<CliRootService>(getRootCliServiceInjectKey(scope))
  await cliService.runCli(options?.argv)
}

/**
 * Parse argv array into options, optionsShort and args
 */
export function parseArgv(argv: Array<string>, offset?: string): ICliArgv {
  const options: Record<string, string | number | boolean> = {}
  const optionsShort: Record<string, string | number | boolean> = {}
  const args: Array<string | number | boolean> = []

  // base is the number of words in the command name
  const base = offset?.split(' ').length ?? 0

  for (let i = base; i < argv.length; i++) {
    const arg = argv[i]

    if (arg.startsWith('--')) {
      // --key value
      const key = arg.slice(2)
      options[key] = argv[i + 1]
      i++

    } else if (arg.startsWith('-')) {
      // -k value
      const key = arg.slice(1)
      optionsShort[key] = argv[i + 1]
      i++

    } else {
      // value
      args.push(arg)
    }
  }

  return {
    options,
    optionsShort,
    args,
  }
}

