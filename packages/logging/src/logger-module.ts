import {configureModule, Container, DynamicModule, getModuleName, Module} from '@silvertree/core'
import {LoggerFactory} from './logger-factory'
import {LoggerModuleConfig} from './types'
import {getLocalLoggerInjectKey, getLoggerFactoryInjectKey} from './util'


export class LoggerModule extends DynamicModule<LoggerModuleConfig> {

  async setup() {
    const provideKey = getLocalLoggerInjectKey(this.config?.scope)
    const factoryKey = getLoggerFactoryInjectKey(this.config?.scope)

    await this.container.waitFowGlobalBinding(factoryKey)

    this.bind.syncFunctional(provideKey, (_mod, _options, ctx) => {
      const factory = this.provideSync<LoggerFactory>(factoryKey)
      const previousModule = ctx.chain[ctx.chain.length - 2]?.module
      const name = previousModule ? getModuleName(previousModule) : 'unknown'

      return factory.getChildLogger(name)
    })
      .export({global: true})
  }

  static configured(
    config: LoggerModuleConfig | ((container: Container, parentMod: Module<any> | null) => LoggerModuleConfig | Promise<LoggerModuleConfig>),
  ) {
    return configureModule(LoggerModule, typeof config === 'object' ? () => config : config)
  }
}
