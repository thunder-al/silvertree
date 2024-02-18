import {Container} from '@silvertree/core'
import {CliRootService} from './CliRootService'

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
  argv?: Array<string>,
) {
  const cliService = await container.provideAsync<CliRootService>(getRootCliServiceInjectKey(scope))
  await cliService.runCli(argv)
}
