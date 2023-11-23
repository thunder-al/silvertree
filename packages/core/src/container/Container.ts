import {DynamicModule, Module} from '../module/Module'
import {getModuleName} from '../module/util'
import {TClassConstructor, TConfiguredModuleTerm} from '../types'
import {extractConfiguredModuleTerm, isClassConstructor} from '../util'

/**
 * Container is a root object of the DI system.
 */
export class Container {
  protected readonly modules = new Set<Module>()
  protected readonly globalModules = new Set<TClassConstructor<Module>>()
  protected readonly dynamicModules = new Set<Module>()

  /**
   * Creates a new container. Just a nice shortcut for `new Container()`.
   */
  public static make(): Container {
    return new Container()
  }

  /**
   * Registers a new module in the container.
   */
  public async register<
    M extends Module,
    Cfg = M extends Module<infer C> ? C : any,
  >(
    module: TClassConstructor<M>,
    configure?: ((container: this, module: null) => Promise<Cfg> | Cfg) | null,
    options?: {
      skipInitPhase?: boolean
    },
  ): Promise<M> {
    if (this.hasModule(module)) {
      return this.getModule(module)
    }

    const config = configure ? await configure(this, null) : null

    const instance = new module(this, config)

    // noinspection SuspiciousTypeOfGuard
    if (instance instanceof DynamicModule) {
      // dynamic module instances will go to a separated set
      this.dynamicModules.add(instance)
    } else {
      this.modules.add(instance)
    }

    // if a module is global, put it into the global modules set
    // noinspection SuspiciousTypeOfGuard
    if (instance.isGlobal() && !this.globalModules.has(module)) {
      this.globalModules.add(module)
    }

    if (!options?.skipInitPhase) {
      await this.initModule(instance)
    }

    return instance
  }

  /**
   * Registers a batch of modules in the container.
   * @param modules
   */
  public async registerBatch(modules: Array<TConfiguredModuleTerm<Module, this, null, any> | TClassConstructor<Module>>) {
    const batchModules: Array<Module> = []

    for (const rawMod of modules) {
      const [module, configure] = extractConfiguredModuleTerm(rawMod)
      const instance = await this.register(module, configure, {skipInitPhase: true})
      batchModules.push(instance)
    }

    await Promise.all(batchModules.map(module => this.initModule(module)))

    return this
  }

  /**
   * Returns all registered modules.
   */
  public getModules(): Set<Module> {
    return this.modules
  }

  /**
   * Returns dynamic modules, registered directly in the container.
   */
  public getDynamicModules(): Set<Module> {
    return this.dynamicModules
  }

  /**
   * Returns global modules in the container.
   */
  public getGlobalModules(): Set<TClassConstructor<Module>> {
    return this.globalModules
  }

  /**
   * Returns global modules instances in the container.
   */
  public* getGlobalModuleInstances() {
    for (const globalModule of this.globalModules) {
      yield this.getModule(globalModule)
    }
  }

  /**
   * Returns true if module is registered in the container.
   */
  public hasModule(module: Module | TClassConstructor<Module>): boolean {
    if (isClassConstructor(module)) {
      for (const mod of this.modules) {
        if (mod instanceof module) {
          return true
        }
      }
    }

    return this.modules.has(module as Module)
  }

  /**
   * Returns a module by its class.
   * @param module
   */
  public getModule<M extends Module>(module: TClassConstructor<M>): M {
    for (const mod of this.modules) {
      if (mod instanceof module) {
        return mod
      }
    }

    throw new Error(`Module ${getModuleName(module)} is not registered`)
  }

  /**
   * Returns dynamic modules, registered directly in the container by class.
   * @param module
   */
  public getDynamicModulesByClass<M extends Module>(module: TClassConstructor<M>): Array<M> {
    const modules: Array<M> = []

    for (const mod of this.dynamicModules) {
      if (mod instanceof module) {
        modules.push(mod)
      }
    }

    return modules
  }

  protected async initModule(module: Module) {
    await module.init()
  }
}


