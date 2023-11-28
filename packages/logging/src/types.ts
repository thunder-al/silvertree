import * as winston from 'winston'

/**
 * The root logger module configuration.
 */
export interface LoggerRootModuleConfig {
  /**
   * The scope of the logger. You can have multiple loggers with different scopes.
   * @default 'default'
   */
  scope?: string
  /**
   * The winston configuration. Used to manually configure edge cases.
   * @see https://github.com/winstonjs/winston
   */
  winston?: winston.LoggerOptions
  /**
   * The log level. This is used to filter log messages.
   * @default process.env.LOG_LEVEL || 'warning'
   */
  level?: winston.LoggerOptions['level']
  /**
   * The base labels for the logger. These are added to every log message of all child loggers.
   */
  baseLabels?: Record<string | symbol, string>
  /**
   * The labels to hide from the log payload in `simple` and `pretty` presets.
   */
  hideLabels?: Array<string | symbol>
  /**
   * Hide the system labels from the log payload in `simple` and `pretty` presets. (Because it's appearing in log messages)
   * @default [LEVEL, SPLAT, 'timestamp', 'module', 'message', 'level', 'hostname']
   */
  hideSystemLabels?: boolean
  /**
   * The logging preset. This is a shorthand for configuring the logger.
   * Use `'none'` to disable presets and use `makeWinstonConfig` to manually configure the logger.
   * @default process.env.LOG_FORMAT || 'simple'
   */
  loggingPreset?: 'simple' | 'pretty' | 'json' | 'none'
  /**
   * The logger configuration. This is used to create the logger's configuration.
   * @param conf The logger preset configuration. If `loggingPreset` is `'none'`, this will be an empty object
   */
  makeWinstonConfig?: (conf: winston.LoggerOptions) => winston.LoggerOptions
  /**
   * The logger factory. This is used to create the logger.
   * @param conf The logger configuration.
   */
  makeLogger?: (conf: winston.LoggerOptions) => winston.Logger
  /**
   * The child logger factory. This is used to create the child logger.
   * @param rootLogger
   * @param module
   * @param conf
   */
  makeChildLogger?: (rootLogger: winston.Logger, module: string, conf: LoggerRootModuleConfig) => winston.Logger
}

/**
 * The logger module configuration.
 */
export interface LoggerModuleConfig {
  /**
   * Module name. Will be shown in log lines.
   */
  module: string
  /**
   * The scope of the root logger module.
   */
  scope?: string
}
