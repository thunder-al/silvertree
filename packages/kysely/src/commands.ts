import {Module} from '@silvertree/core'
import type {CliRootService} from '@silvertree/cli'
import * as kysely from 'kysely'

export async function attachDbCommands(
  module: Module<any>,
  scope: boolean | string = 'default',
) {
  const scopeStr = typeof scope === 'boolean' ? 'default' : scope

  const cliModule = await import('@silvertree/cli')
  const cli = module.provideSync<CliRootService>(cliModule.getRootCliServiceInjectKey(scopeStr))

  const cliSuffix = scopeStr === 'default' ? '' : `-${scopeStr}`

  // noinspection TypeScriptValidateJSTypes
  cli.registerCommand({
    name: `db${cliSuffix} migrate`,
    description: 'Run database migrations',
    arguments: [],
    options: [],
    async action() {
      console.log('Running migrations')

      const migrator = await module.provideAsync<kysely.Migrator>('migrator')
      const result = await migrator.migrateToLatest()

      if (result.error) {
        throw result.error
      }

      const migrations = result.results ?? []

      if (migrations.length === 0) {
        console.log('No migrations to run')
        return
      }

      console.log('Migrations run:')
      for (const migration of migrations) {
        console.log(`${migration.migrationName.padEnd(40)} ${migration.status.padStart(12)}`)
      }
    },
  })
}
