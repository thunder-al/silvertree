import * as kysely from 'kysely'
import {Migration} from 'kysely/dist/cjs/migration/migrator'

export function getKyselyServiceInjectKey(scope?: string): string {
  return `kysely:service:${scope ?? 'default'}`
}

export function getKyselyInjectKey(scope?: string): string {
  return `kysely:db:${scope ?? 'default'}`
}

export function getKyselyMigratorInjectKey(scope?: string): string {
  return `kysely:migrator:${scope ?? 'default'}`
}

export function makeMigrationProviderFromViteGlobImport(
  glob: Record<string, kysely.Migration | (() => kysely.Migration | Promise<kysely.Migration>)>,
): kysely.MigrationProvider {
  return {
    async getMigrations(): Promise<Record<string, Migration>> {

      const migrationMapping: Record<string, string> = {}

      for (const file in glob) {
        const name = file.replace(/^.+\//, '') // remove path
          .replace(/\.m?[tj]sx?$/, '') // remove extension

        migrationMapping[name] = file
      }

      const sortedMigrations = Object.keys(migrationMapping)
        .sort(
          // ascending sort by numbers in the name
          (a, b) => parseInt(a.replace(/\D/, '')) - parseInt(b.replace(/\D/, '')),
        )

      const loadedMigrations = await Promise.all(
        sortedMigrations.map(async el => {
          const moduleName = migrationMapping[el]
          const moduleOrFn = glob[moduleName]
          const module = typeof moduleOrFn === 'function' ? await moduleOrFn() : moduleOrFn

          return [el, module] as const
        }),
      )

      return loadedMigrations.reduce(
        (acc, [name, migration]) => ({...acc, [name]: migration}),
        {} as Record<string, Migration>,
      )
    },
  }
}
