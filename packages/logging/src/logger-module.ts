import {
  AbstractSyncFactory,
  DynamicModule,
  EMPTY_META_TARGET,
  getModuleName,
  IInjectOptions,
  TProvideContext,
} from '@silvertree/core'
import {LoggerFactory} from './logger-factory'
import {LoggerModuleConfig} from './types'
import * as winston from 'winston'
import {getLocalLoggerInjectKey, getLoggerFactoryInjectKey} from './util'


export class LoggerModule extends DynamicModule<LoggerModuleConfig> {

  async setup() {
    const provideKey = getLocalLoggerInjectKey(this.config?.scope)
    this.bindSync(provideKey, new LocalLoggerFactory(this)).export()
  }

  public getConfig() {
    return this.config
  }
}

export class LocalLoggerFactory extends AbstractSyncFactory<winston.Logger, LoggerModule> {

  protected localLogger!: winston.Logger

  public get(module: LoggerModule, options: Partial<IInjectOptions> | null, ctx: TProvideContext): winston.Logger {
    if (!this.localLogger) {
      const factoryKey = getLoggerFactoryInjectKey(module.getConfig()?.scope)
      const factory = module.provideSync<LoggerFactory>(factoryKey)
      const name = getModuleName(ctx.chain[ctx.chain.length - 2]?.module)

      this.localLogger = factory.getChildLogger(name)
    }

    return this.localLogger
  }

  public getMetadataTarget(module: LoggerModule): any {
    return EMPTY_META_TARGET
  }
}
