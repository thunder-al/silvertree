/// <reference types="vite/client" />

import * as kysely from 'kysely'
import {KyselyRootModule} from './KyselyRootModule'
import {Container, IInjectOptions, TProvideContext} from '@silvertree/core'
import {Migration} from 'kysely/dist/cjs/migration/migrator'

/**
 * KyselyDatabase is the interface for Kysely query builder where you can extend your own database entities globally.
 * @example
 * declare module '@silvertree/kysely' {
 *   interface KyselyDatabase {
 *     users: {
 *       id: number
 *       name: string
 *     }
 *   }
 * }
 */
interface KyselyDatabase {
}

/**
 * KyselyGlobal is the global type for Kysely query builder instance which you can extend via `KyselyDatabase` interface.
 * @see KyselyDatabase
 */
export type KyselyGlobal<T = KyselyDatabase> = kysely.Kysely<T>

export interface IKyselyRootModuleConfig {
  /**
   * The scope of the Kysely instance.
   * You may have multiple instances of Kysely with different scopes.
   */
  scope?: string
  /**
   * The factory function to create a Kysely instance.
   * It will completely override the default Kysely creation mechanism.
   */
  kyselyFactory?: (module: KyselyRootModule, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => kysely.Kysely<any> | Promise<kysely.Kysely<any>>
  /**
   * The factory function to create a Kysely logger.
   */
  kyselyLoggerFactory?: (module: KyselyRootModule, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => kysely.LogConfig | Promise<kysely.LogConfig>
  /**
   * The factory function to create a Kysely dialect.
   */
  kyselyDialectFactory?: (module: KyselyRootModule, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => kysely.Dialect | Promise<kysely.Dialect>
  /**
   * The factory function to create a Kysely migrator.
   */
  kyselyMigratorFactory?: (module: KyselyRootModule, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => kysely.Migrator | Promise<kysely.Migrator>
  /**
   * The plugins to use for the Kysely instance.
   */
  plugins?: kysely.KyselyPlugin[]
  /**
   * The dialect of the database.
   * Environment variable: `DB_DIALECT` or `DB_${scope}_DIALECT`
   * @default 'postgres'
   */
  dialect?: 'sqlite' | 'mysql' | 'postgres' | string,
  /**
   * The logger to use for the database connection.
   */
  logger?: 'silvertree' | 'console' | Array<kysely.LogLevel> | kysely.Logger,
  /**
   * The connection URL to the database.
   * Use this or `host`, `port`, `user`, `password`, `database` to connect to the database.
   * Environment variable: `DB_CONNECTION_URL` or `DB_${scope}_CONNECTION_URL`
   */
  url?: string
  /**
   * The host of the database.
   * Environment variable: `DB_HOST` or `DB_${scope}_HOST`
   */
  host?: string
  /**
   * The port of the database.
   * Environment variable: `DB_PORT` or `DB_${scope}_PORT`
   */
  port?: number
  /**
   * The user of the database.
   * Environment variable: `DB_USER` or `DB_${scope}_USER`
   */
  user?: string
  /**
   * The password of the database.
   * Environment variable: `DB_PASSWORD` or `DB_${scope}_PASSWORD`
   */
  password?: string
  /**
   * The database name.
   * Environment variable: `DB_DATABASE` or `DB_${scope}_DATABASE`
   */
  database?: string
  /**
   * If false it will allow self-signed database certificates.
   * @default true
   */
  rejectUnauthorized?: boolean
  /**
   * Executed once for each created connection in pool.
   */
  onConnect?: (connection: kysely.DatabaseConnection) => Promise<void>
  /**
   * Try to add the commands to @silvertree/cli to manage database.
   * If `false` it will not attach any commands.
   * If `true` it will try to attach the commands to the default cli scope.
   * If a string it will try to attach the commands to the specified cli scope.
   */
  attachCommands?: boolean | string
  /**
   * The migration configuration.
   */
  migrations?: {
    /**
     * Enable or disable the migration feature.
     * @default true
     */
    enabled?: boolean
    /**
     * Parameters for the migrator.
     */
    params?: Omit<kysely.MigratorProps, 'db' | 'provider'>
    /**
     * The migration provider.
     */
    provider: (container: Container, module: KyselyRootModule, kysely: kysely.Kysely<any>) => Promise<Record<string, Migration>> | Record<string, Migration>
  }
}
