import {configureModule, Container, DynamicModule, Module} from '@silvertree/core'
import {LoggerFactory} from './logger-factory'
import {LoggerRootModuleConfig} from './types'
import {getLoggerFactoryInjectKey, getRootLoggerInjectKey} from './util'

export class LoggerRootModule extends DynamicModule<LoggerRootModuleConfig> {

  async setup() {
    const loggerFactoryKey = getLoggerFactoryInjectKey(this.config?.scope)

    this.bind.syncSingletonClass(LoggerFactory)
      .alias(loggerFactoryKey)
      .export({withAliases: true})

    this.exportGlobal(loggerFactoryKey)

    const rootLoggerKey = getRootLoggerInjectKey(this.config?.scope)

    this.bind.syncFunctional(rootLoggerKey, () => {
      const factory = this.provideSync<LoggerFactory>(loggerFactoryKey)
      return factory.getRootLogger()
    })
      .export({withAliases: true})

    this.exportGlobal(rootLoggerKey)
  }

  static configured(
    config: LoggerRootModuleConfig | ((container: Container, parentMod: Module<any> | null) => LoggerRootModuleConfig | Promise<LoggerRootModuleConfig>),
  ) {
    return configureModule(LoggerRootModule, typeof config === 'object' ? () => config : config)
  }
}
