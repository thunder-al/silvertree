import {configureModule, Container, DynamicModule, Module, ModuleError} from '@silvertree/core'
import {IHttpModuleConfig} from './types'
import {getHttpRootRegistrarInjectKey, getHttpRootServiceInjectKey} from './util'
import {HttpRootService} from './http-root-service'
import {HttpRootRegistrarService} from './http-root-registrar-service'


export class HttpModule extends DynamicModule<IHttpModuleConfig> {

  async setup() {
    if (this.importer instanceof Container) {
      throw new ModuleError(this, 'HttpModule cannot be imported into a container, it must be imported into a module')
    }

    const serviceKey = getHttpRootServiceInjectKey(this.config?.scope)
    const routesKey = getHttpRootRegistrarInjectKey(this.config?.scope)

    await this.container.waitFowGlobalBinding([serviceKey, routesKey])

    // register controllers if its defined
    if (this.config?.controllers) {
      const routesSvc = this.provideSync<HttpRootRegistrarService>(routesKey)
      const httpSvc = this.provideSync<HttpRootService>(serviceKey)

      for (const term of this.config.controllers) {
        routesSvc.registerHttpController(term.controller, this.importer, this.config?.useFastifyRegister)
      }

      if (httpSvc.isServerStarted()) {
        await routesSvc.attachPendingComponents()
      }
    }
  }

  static configured(
    config: IHttpModuleConfig | ((container: Container, parentMod: Module<any> | null) => IHttpModuleConfig | Promise<IHttpModuleConfig>),
  ) {
    return configureModule(HttpModule, typeof config === 'object' ? () => config : config)
  }
}
