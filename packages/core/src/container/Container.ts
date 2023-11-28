import {DynamicModule, Module} from '../module/Module'
import {bindingKeyToString, getModuleName} from '../module/util'
import {
  IInjectOptions,
  TBindKey,
  TBindKeyRef,
  TClassConstructor,
  TConfiguredModuleTerm,
  TProvideContext,
} from '../types'
import {extractConfiguredModuleTerm, isClassConstructor, resolveBindingKey} from '../util'
import {AbstractAsyncFactory, AbstractSyncFactory} from '../factory'
import {ContainerProviderError} from './exceptions'

/**
 * Container is a root object of the DI system.
 */
export class Container {
  protected readonly modules = new Set<Module>()
  protected readonly dynamicModules = new Set<Module>()

  protected readonly globalFactoryRefs = new Map<Module, Set<TBindKey>>()

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

  /**
   * Internal method for initializing a module.
   * @param module
   * @protected
   */
  protected async initModule(module: Module) {
    await module.init()
  }

  /**
   * Registers a sync factory with a key as a global exported binding. Module also should export this key.
   * @param module
   * @param key
   */
  public registerGlobalBindingRef(module: Module, key: TBindKey | TBindKeyRef) {
    key = resolveBindingKey(key)
    if (!module.hasExportedSyncBinding(key) && !module.hasExportedAsyncBinding(key)) {
      throw new ContainerProviderError(this, `Cannot register global export: key ${bindingKeyToString(key)} not found in module ${getModuleName(module)} exports`)
    }

    if (!this.globalFactoryRefs.has(module)) {
      this.globalFactoryRefs.set(module, new Set())
    }

    this.globalFactoryRefs.get(module)!.add(key)
  }

  /**
   * Returns a sync factory by its key from already bound as global bindings.
   * @param key
   */
  public getSyncModuleFactory<
    T = any,
    M extends Module = Module,
    F extends AbstractSyncFactory<T, M> = AbstractSyncFactory<T, M>
  >(key: TBindKey): [F, M] {

    for (let module of this.globalFactoryRefs.keys()) {
      const refs = this.globalFactoryRefs.get(module)!

      if (refs.has(key) && module.hasExportedSyncBinding(key)) {
        const [factory] = module.getSyncFactory(key)
        return [
          factory as F,
          module as M,
        ]
      }
    }

    throw new ContainerProviderError(this, `Sync factory ${key.toString()} not found in global exports`)
  }

  /**
   * Returns an async factory by its key from already bound as global bindings.
   * @param key
   */
  public getAsyncModuleFactory<
    T = any,
    M extends Module = Module,
    F extends AbstractAsyncFactory<T, M> = AbstractAsyncFactory<T, M>
  >(key: TBindKey): [F, M] {

    for (let module of this.globalFactoryRefs.keys()) {
      const refs = this.globalFactoryRefs.get(module)!

      if (refs.has(key) && module.hasExportedAsyncBinding(key)) {
        const [factory] = module.getAsyncFactory(key)
        return [
          factory as F,
          module as M,
        ]
      }
    }

    throw new ContainerProviderError(this, `Async factory ${key.toString()} not found in global exports`)
  }

  /**
   * Determines if a sync binding exists in global exports.
   * @param key
   */
  public hasSyncBinding(key: TBindKey): boolean {
    for (let module of this.globalFactoryRefs.keys()) {
      const refs = this.globalFactoryRefs.get(module)!

      if (refs.has(key)) {
        return true
      }
    }

    return false
  }

  /**
   * Determines if an async binding exists in global exports.
   * @param key
   */
  public hasAsyncBinding(key: TBindKey): boolean {

    for (let module of this.globalFactoryRefs.keys()) {
      const refs = this.globalFactoryRefs.get(module)!

      if (refs.has(key)) {
        return true
      }
    }

    return false
  }

  /**
   * Provides a value of a binding by its key.
   * @param key
   * @param options
   * @param ctx
   */
  public provideSync<T>(key: TClassConstructor<T>, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): T
  public provideSync<T>(key: string | symbol, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): T
  public provideSync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): T {
    const [_, module] = this.getSyncModuleFactory(key)
    return module.provideSync(key as string, options, ctx)
  }

  /**
   * Provides a value of a binding by its key.
   * @param key
   * @param options
   * @param ctx
   */
  public provideAsync<T>(key: TClassConstructor<T>, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): Promise<T>
  public provideAsync<T>(key: string | symbol, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): Promise<T>
  public async provideAsync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): Promise<T> {
    const [_, module] = this.getAsyncModuleFactory(key)
    return await module.provideAsync(key as string, options, ctx)
  }
}


