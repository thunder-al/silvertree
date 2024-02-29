import {Inject} from '@silvertree/core'
import {getKyselyInjectKey, getKyselyMigratorInjectKey} from './util'

export function InjectKysely(scope?: string): PropertyDecorator {
  return Inject(getKyselyInjectKey(scope))
}

export function InjectKyselyMigrator(scope?: string): PropertyDecorator {
  return Inject(getKyselyMigratorInjectKey(scope))
}
