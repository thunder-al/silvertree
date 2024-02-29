import {configureModule, Container, DynamicModule, Module} from '@silvertree/core'
import {IHttpRootModuleConfig} from './types'
import {HttpRootService} from './HttpRootService'
import {getFastifyInjectKey, getHttpRootRegistrarInjectKey, getHttpRootServiceInjectKey} from './util'
import {FastifyLoggerAdapter} from './FastifyLoggerAdapter'
import {HttpRootRegistrarService} from './HttpRootRegistrarService'
import {LoggerModule} from '@silvertree/logging'
import {attachHttpCommands} from './commands'

export class HttpRootModule extends DynamicModule<IHttpRootModuleConfig> {

  async setup() {

    await this.import([
      LoggerModule,
    ])

    const serviceKey = getHttpRootServiceInjectKey(this.config?.scope)
    const registrarKey = getHttpRootRegistrarInjectKey(this.config?.scope)
    const fastifyKey = getFastifyInjectKey(this.config?.scope)

    // service

    this.bind.syncSingletonClass(FastifyLoggerAdapter)
    this.bind.syncSingletonClass(HttpRootService)
      .alias(serviceKey)

    this.export(serviceKey)
    this.exportGlobal(serviceKey)

    // registrations

    this.bind.syncSingletonClass(HttpRootRegistrarService)
      .alias(registrarKey)

    this.export(registrarKey)
    this.exportGlobal(registrarKey)

    // fastify instance

    this.bind.syncFunctional(fastifyKey, () => this.provideSync(HttpRootService).getServer())
      .alias('fastify')
      .export({global: true})

    // register commands
    if (this.config?.attachCommands ?? true) {
      try {
        await attachHttpCommands(this, this.config?.scope)
      } catch (e: any) {
        if (this.config?.attachCommands !== undefined) {
          console.error('Failed to attach http commands. Did you register the cli module?')
        }
      }
    }
  }

  static configured(
    config: IHttpRootModuleConfig | ((container: Container, parentMod: Module<any> | null) => IHttpRootModuleConfig | Promise<IHttpRootModuleConfig>),
  ) {
    return configureModule(HttpRootModule, typeof config === 'object' ? () => config : config)
  }
}

