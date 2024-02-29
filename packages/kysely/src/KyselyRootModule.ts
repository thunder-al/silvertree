import {configureModule, Container, DynamicModule, Module} from '@silvertree/core'
import {getKyselyInjectKey, getKyselyMigratorInjectKey} from './util'
import {IKyselyRootModuleConfig} from './types'
import {
  kyselyInstanceFactoryGuard,
  makeKyselyDialectFactory,
  makeKyselyFactory,
  makeKyselyLoggerFactory,
  makeKyselyMigratorFactory,
} from './factories'
import {attachDbCommands} from './commands'

export class KyselyRootModule extends DynamicModule<IKyselyRootModuleConfig> {

  async setup() {
    this.bindKyselyLoggerFactory()
    this.bindDialectFactory()
    this.bindKyselyFactory()
    this.bindKyselyMigratorFactory()
    await this.attachKyselyCommands()
  }

  protected bindKyselyFactory() {
    const dbKey = getKyselyInjectKey(this.config?.scope)
    const kyselyFactory = this.config?.kyselyFactory ?? makeKyselyFactory()

    this.bind.functional(dbKey, kyselyInstanceFactoryGuard(kyselyFactory), {singleton: true})
      .alias('kysely')
      .export()

    this.exportGlobal(dbKey)
  }

  protected bindKyselyLoggerFactory() {
    const loggerFactory = this.config?.kyselyLoggerFactory ?? makeKyselyLoggerFactory()
    this.bind.functional('logger', loggerFactory, {singleton: true})
  }

  protected bindDialectFactory() {
    const dialectFactory = this.config?.kyselyDialectFactory ?? makeKyselyDialectFactory()
    this.bind.functional('dialect', dialectFactory, {singleton: true})
  }

  static configured(
    config: IKyselyRootModuleConfig | ((container: Container, parentMod: Module<any> | null) => IKyselyRootModuleConfig | Promise<IKyselyRootModuleConfig>),
  ) {
    return configureModule(KyselyRootModule, typeof config === 'object' ? () => config : config)
  }

  static configuredFromEnv(
    config?: {
      scope?: string,
      modify?: (container: Container, parentMod: Module<any> | null, configurationFromEnv: IKyselyRootModuleConfig) => IKyselyRootModuleConfig | Promise<IKyselyRootModuleConfig>,
    },
  ) {
    const envConfig = configureFromEnv(config?.scope)

    if (config?.modify) {
      const tap = config.modify
      return configureModule(
        KyselyRootModule,
        (container: Container, parentMod: Module | null) => tap(container, parentMod, envConfig),
      )
    }

    return configureModule(KyselyRootModule, () => envConfig)
  }

  protected bindKyselyMigratorFactory() {
    if (this.config?.migrations?.enabled === false) {
      return
    }

    const migratorKey = getKyselyMigratorInjectKey(this.config?.scope)
    const migratorFactory = this.config?.kyselyMigratorFactory ?? makeKyselyMigratorFactory()

    this.bind.functional(migratorKey, migratorFactory, {singleton: true})
      .alias('migrator')
      .export()

    this.exportGlobal(migratorKey)
  }

  protected async attachKyselyCommands() {
    if (this.config?.attachCommands === false) {
      return
    }

    try {
      await attachDbCommands(this, this.config?.attachCommands)
    } catch (e: any) {
      console.warn('Cannot import or provide @silvertree/cli. Skipping db commands')
    }
  }
}

function configureFromEnv(scope?: string): IKyselyRootModuleConfig {
  const envScope = (scope ?? 'default').toUpperCase()

  let rejectUnauthorized: boolean | undefined = undefined
  const rejectUnauthorizedParam = process.env[`DB_${envScope}_REJECT_UNAUTHORIZED`] ?? process.env.DB_REJECT_UNAUTHORIZED

  if (rejectUnauthorizedParam === 'false') {
    rejectUnauthorized = false
  }

  return {
    scope: scope,
    dialect: process.env[`DB_${envScope}_DIALECT`] ?? process.env.DB_DIALECT ?? 'postgres',
    url: process.env[`DB_${envScope}_CONNECTION_URL`] ?? process.env.DB_CONNECTION_URL,
    host: process.env[`DB_${envScope}_HOST`] ?? process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env[`DB_${envScope}_PORT`] ?? process.env.DB_PORT ?? '5432'),
    user: process.env[`DB_${envScope}_USER`] ?? process.env.DB_USER,
    password: process.env[`DB_${envScope}_PASSWORD`] ?? process.env.DB_PASSWORD,
    database: process.env[`DB_${envScope}_DATABASE`] ?? process.env.DB_DATABASE,
    rejectUnauthorized,
  }
}
