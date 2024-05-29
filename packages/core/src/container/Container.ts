import {bindingKeyToString, FiberModule, getModuleName, isSvtModuleHasTrait, Module} from '../module'
import {
  IInjectOptions,
  TBindKey,
  TBindKeyRef,
  TClassConstructor,
  TConfiguredModuleTerm,
  TProvideContext,
} from '../types'
import {extractConfiguredModuleTerm, instanceOf, isClassConstructor, resolveBindingKey} from '../util'
import {IAsyncFactory, ISyncFactory} from '../factory'
import {ContainerError} from './exceptions'

/**
 * Container is a root object of the DI system.
 */
export class Container {
  protected readonly modules = new Set<Module>()
  protected readonly dynamicModules = new Set<Module>()

  protected readonly globalFactoryRefs = new Map<Module, Set<TBindKey>>()

  protected readonly globalRefWaiters = new Map<TBindKey, Set<() => unknown>>()

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
    if (instanceOf(module, FiberModule)) {
      throw new ContainerError(this, `Cannot register ${getModuleName(module)} module because its a FiberModule`)
    }

    if (this.hasModule(module)) {
      return this.getModule(module)
    }

    const config = configure ? await configure(this, null) : null

    const instance = new module(this, config)

    if (isSvtModuleHasTrait(instance, 'dynamic')) {
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
        if (mod.constructor === module) {
          return true
        }
      }

      return false
    }

    return this.modules.has(module) || this.dynamicModules.has(module)
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
      throw new ContainerError(this, `Cannot register global export: key ${bindingKeyToString(key)} not found in module ${getModuleName(module)} exports`)
    }

    if (!this.globalFactoryRefs.has(module)) {
      this.globalFactoryRefs.set(module, new Set())
    }

    this.globalFactoryRefs.get(module)!.add(key)

    if (this.globalRefWaiters.has(key)) {
      for (const waiter of this.globalRefWaiters.get(key)!) {
        waiter()
      }
    }
  }

  /**
   * Returns a sync factory by its key from already bound as global bindings.
   * @param key
   */
  public getSyncModuleFactory<
    T = any,
    M extends Module = Module,
    F extends ISyncFactory<T, M> = ISyncFactory<T, M>
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

    throw new ContainerError(this, `Sync factory ${key.toString()} not found in global exports`)
  }

  /**
   * Returns an async factory by its key from already bound as global bindings.
   * @param key
   */
  public getAsyncModuleFactory<
    T = any,
    M extends Module = Module,
    F extends IAsyncFactory<T, M> = IAsyncFactory<T, M>
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

    throw new ContainerError(this, `Async factory ${key.toString()} not found in global exports`)
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
  public provideSync<T = any>(key: string | symbol, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): T
  public provideSync<T = any>(key: TBindKey, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): T
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
  public provideAsync<T = any>(key: string | symbol, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): Promise<T>
  public provideAsync<T = any>(key: TBindKey, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): Promise<T>
  public async provideAsync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): Promise<T> {
    const [_, module] = this.getAsyncModuleFactory(key)
    return await module.provideAsync(key as string, options, ctx)
  }

  /**
   * Returns a promise which will be resolved when all global bindings are available.
   */
  public waitFowGlobalBinding(key: TBindKey | TBindKeyRef | Array<TBindKey | TBindKeyRef>) {
    const keys = Array.isArray(key) ? key : [key]

    return new Promise<void>(resolve => {
      let pendingCount = keys.length

      function commitResolve() {
        if (--pendingCount === 0) {
          resolve()
        }
      }

      for (const k of keys) {
        const key = resolveBindingKey(k)

        // check if binding is already available
        // async check will check for async bindings too
        if (this.hasAsyncBinding(key)) {
          commitResolve()
          continue
        }

        if (!this.globalRefWaiters.has(key)) {
          this.globalRefWaiters.set(key, new Set())
        }

        this.globalRefWaiters.get(key)!.add(commitResolve)
      }
    })
  }
}


