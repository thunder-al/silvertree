import {IInjectOptions, TProvideContext} from '@silvertree/core'
import {KyselyRootModule} from './KyselyRootModule'
import {KyselyError} from './exception'
import * as kysely from 'kysely'
import {makeKyselyLogger} from './logger'

export function makeKyselyFactory() {
  return async function (
    module: KyselyRootModule,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ) {
    const config = module.getModuleConfig()
    const [log, dialect] = await Promise.all([
      module.provideAsync<kysely.LogConfig>('logger'),
      module.provideAsync<kysely.Dialect>('dialect'),
    ])

    return new kysely.Kysely({
      log,
      plugins: config?.plugins,
      dialect,
    })
  }
}


export function kyselyInstanceFactoryGuard(
  factory: (module: KyselyRootModule, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => any | Promise<any>,
) {
  return async function (
    module: KyselyRootModule,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ) {
    const instance = await factory(module, options, ctx)

    if (!instance) {
      throw new KyselyError('Factory returned empty value instead of Kysely instance')
    }

    if (!(instance instanceof kysely.Kysely)) {
      throw new KyselyError('Factory returned invalid value instead of Kysely instance')
    }

    return instance
  }
}

export function makeKyselyLoggerFactory() {
  return async function (
    module: KyselyRootModule,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<kysely.LogConfig> {
    const config = module.getModuleConfig()
    const loggerConf = config?.logger ?? 'silvertree'

    if (loggerConf === 'console') {
      return ['error']
    }

    if (loggerConf === 'silvertree') {
      return makeKyselyLogger(module)
    }

    return loggerConf
  }
}

export function makeKyselyDialectFactory() {
  return async function (
    module: KyselyRootModule,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<kysely.Dialect> {
    const config = module.getModuleConfig()
    const dialect = config?.dialect ?? 'postgres'

    if (dialect === 'sqlite') {
      const sqliteModule = await import('better-sqlite3')
      return new kysely.SqliteDialect({
        database: new sqliteModule.default(config?.url),
        onCreateConnection: config?.onConnect,
      })
    }

    if (dialect === 'mysql') {
      const mysqlModule = await import('mysql2')
      const connectionConfig: Parameters<typeof mysqlModule.createPool>[0] = {
        uri: config?.url,
        host: config?.host,
        port: config?.port,
        user: config?.user,
        password: config?.password,
        database: config?.database,
      }

      if (config?.rejectUnauthorized === false) {
        connectionConfig.ssl = {rejectUnauthorized: false}
      }

      return new kysely.MysqlDialect({
        pool: mysqlModule.createPool(connectionConfig),
        onCreateConnection: config?.onConnect,
      })
    }

    if (dialect === 'postgres') {
      const pgModule = await import('pg')
      const connectionConfig: ConstructorParameters<typeof pgModule.Pool>[0] = {
        connectionString: config?.url,
        host: config?.host,
        port: config?.port,
        user: config?.user,
        password: config?.password,
        database: config?.database,
      }

      if (config?.rejectUnauthorized === false) {
        connectionConfig.ssl = {rejectUnauthorized: false}
      }

      return new kysely.PostgresDialect({
        pool: new pgModule.Pool(connectionConfig),
        onCreateConnection: config?.onConnect,
      })
    }

    throw new KyselyError(`Invalid dialect ${dialect}`)
  }
}

export function makeKyselyMigratorFactory() {
  return async function (
    module: KyselyRootModule,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<kysely.Migrator> {
    const config = module.getModuleConfig()
    const kyselyInstance = await module.provideAsync('kysely')

    const provider = config?.migrations?.provider
    if (!provider) {
      throw new KyselyError('Migrations provider is not defined')
    }

    return new kysely.Migrator({
      db: kyselyInstance,
      provider: {
        async getMigrations() {
          return provider(module.getContainer(), module, kyselyInstance)
        },
      },
      ...(config?.migrations?.params ?? {}),
    })
  }
}
