import {configureModule, Container, DynamicModule, Module, TConfiguredModuleTerm} from '@silvertree/core'
import {IHttpRootModuleConfig} from './types'
import {HttpRootService} from './http-root-service'
import {getFastifyInjectKey, getHttpRootRegistrarInjectKey, getHttpRootServiceInjectKey} from './util'
import {FastifyLoggerAdapter} from './fastify-logger-adapter'
import {HttpRootRegistrarService} from './http-root-registrar-service'
import {LoggerModule} from '@silvertree/logging'

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

  }

  static configured(
    config: IHttpRootModuleConfig | ((container: Container, parentMod: Module<any> | null) => IHttpRootModuleConfig | Promise<IHttpRootModuleConfig>),
  ) {
    return configureModule(HttpRootModule, typeof config === 'object' ? () => config : config)
  }
}

