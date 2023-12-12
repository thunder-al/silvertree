import {HttpRootService} from './http-root-service'
import {
  bindingKeyToString,
  callClassMethodWithAsyncInjections,
  getModuleName,
  InjectFromRef,
  InjectModule,
  InjectModuleConfig,
  Module,
  ModuleBindingError,
  resolveBindingKey,
  TBindKey,
  TBindKeyRef,
} from '@silvertree/core'
import {InjectLogger, Logger} from '@silvertree/logging'
import {IHttpControllerRegistrationTerm, IHttpRootModuleConfig} from './types'
import {FastifyInstance} from 'fastify'
import {HttpRootModule} from './http-root-module'
import {getHttpControllerSetupMetadata, getHttpRoutesMetadata} from './metadata'
import {HttpRequestFiberModule} from './http-request-fiber-module'
import {TClassConstructor} from '@silvertree/core/src'

export class HttpRootRegistrarService {

  @InjectFromRef(() => HttpRootService)
  protected readonly svc!: HttpRootService

  @InjectLogger()
  protected readonly logger!: Logger

  @InjectModule()
  protected readonly module!: HttpRootModule

  @InjectModuleConfig()
  protected readonly config?: IHttpRootModuleConfig

  protected pendingControllers: Set<IHttpControllerRegistrationTerm> = new Set()
  protected registeredControllers: Set<IHttpControllerRegistrationTerm> = new Set()

  /**
   * Registers a controller to be attached to the server.
   * This call will not create a controller until the server is started
   */
  public registerHttpController(controller: TBindKey | TBindKeyRef, module: Module, useFastifyRegister: boolean = true) {
    const controllerKey = resolveBindingKey(controller)

    if (!module.hasOwnBindOrAlias(controllerKey)) {
      if (typeof controllerKey !== 'function') {
        throw new ModuleBindingError(module, `Passed non-class ${bindingKeyToString(controller)} (possibly alias) controller which not bound in module ${getModuleName(module)}`)
      }

      module.bind.singletonClass(controller as TClassConstructor)
    }

    this.pendingControllers.add({controller, module, useFastifyRegister})
    this.logger.debug(`Registered controller ${bindingKeyToString(controller)} for module ${getModuleName(module)} in scope ${this.svc.getScope()}`)
  }

  /**
   * Creates and attaches all pending controllers to the server.
   */
  public async attachPendingComponents() {
    const server = await this.module.provideAsync<FastifyInstance>('fastify')

    const batch: Array<Promise<void>> = []

    for (const term of this.pendingControllers) {
      batch.push(this.attachController(term, server))
    }

    await Promise.all(batch)

    this.pendingControllers.clear()
  }

  protected async attachController(term: IHttpControllerRegistrationTerm, server: FastifyInstance) {

    // this is the execution content of the controller
    const target = this.createScopedRegisteringFunction(term)

    if (term.useFastifyRegister) {
      await server.register(target)
    } else {
      await target(server)
    }

    this.registeredControllers.add(term)
    this.logger.debug(`Controller ${bindingKeyToString(term.controller)} for module ${getModuleName(term.module)} has been attached to the server in scope ${this.svc.getScope()}`)
  }

  /**
   * Creates a function which will register a controller in the server.
   */
  protected createScopedRegisteringFunction(term: IHttpControllerRegistrationTerm) {

    const routesMeta = getHttpRoutesMetadata(term.controller)
    const setupMeta = getHttpControllerSetupMetadata(term.controller)

    // save `this` context on HttpRootRegisterService
    return async (server: FastifyInstance) => {

      const key = resolveBindingKey(term.controller)
      const instance = await term.module.provideAsync(key)
      const modCls = this.config?.requestFiberModuleClass ?? HttpRequestFiberModule

      // register routes
      for (const meta of routesMeta) {
        server.route({
          ...meta.r,
          async handler(request, reply) {
            const mod = new modCls(term.module.getContainer(), term.module)
            mod.bindFastify(server)
            mod.bindRequestPayload(request, reply)

            return await callClassMethodWithAsyncInjections(
              mod,
              key,
              instance,
              meta.m,
            )
          },
        })
      }

      // apply setup functions
      for (const meta of setupMeta) {
        const mod = new modCls(term.module.getContainer(), term.module)
        mod.bindFastify(server)

        await callClassMethodWithAsyncInjections(
          mod,
          key,
          instance,
          meta.m,
        )
      }

    }
  }
}
