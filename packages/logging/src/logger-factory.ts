import {InjectModuleConfig} from '@silvertree/core'
import {LoggerRootModuleConfig} from './types'
import {createLogger, format, Logger, LoggerOptions} from 'winston'
import {makeJsonFormatter, makePrettyFormatter, makeSimpleFormatter} from './formatters'

export class LoggerFactory {

  @InjectModuleConfig()
  protected readonly config!: LoggerRootModuleConfig

  protected logger!: Logger

  public getRootLogger(): Logger {
    if (!this.logger) {
      this.logger = this.makeWinstonLogger()
    }

    return this.logger
  }

  public getChildLogger(module: string): Logger {
    const root = this.getRootLogger()

    if (this.config?.makeChildLogger) {
      return this.config.makeChildLogger(root, module, this.config)
    }

    return this.makeChildLogger(root, module)
  }

  protected makeChildLogger(root: Logger, module: string): Logger {
    return root.child({module})
  }

  protected makeWinstonLogger(): Logger {
    const config = this.makeWinstonConfig()
    return createLogger(config)
  }

  protected makeWinstonConfig(): LoggerOptions {
    const config = this.config?.winston ?? {}

    config.level = config.level ?? (process.env.LOG_LEVEL || 'info')
    config.defaultMeta = config.defaultMeta ?? {}
    config.format = this.makeLoggerFormatter()

    this.applyLoggingPreset(config)

    return config
  }

  protected makeLoggerFormatter(): LoggerOptions['format'] {
    const formatter = this.config?.winston?.format
    if (formatter) {
      return formatter
    }

    return format.combine(
      format.timestamp(),
    )
  }

  protected applyLoggingPreset(config: LoggerOptions) {
    switch (this.config?.loggingPreset ?? 'simple') {
      case 'simple':
        config.transports = makeSimpleFormatter(this.config)
        break
      case 'pretty':
        config.transports = makePrettyFormatter(this.config)
        break
      case 'json':
        config.transports = makeJsonFormatter(this.config)
        break
      case 'none':
        break
      default:
        throw new Error(`Unknown logging preset: ${this.config.loggingPreset}`)
    }
  }
}
