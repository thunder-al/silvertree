import {Container} from '../container'
import {IAsyncFactory, ISyncFactory} from '../factory'
import {BindManager} from './BindManager'
import {makeAsyncToSyncProvidingError, makeNoBindingError, ModuleBindingError, ModuleError} from './exceptions'
import {bindingKeyToString, getModuleName, isSvtModuleHasTrait} from './util'
import {IInjectOptions, TBindKey, TClassConstructor, TConfiguredModuleTerm, TProvideContext} from '../types'
import {INJECT_MODULE_CONFIG_METADATA_KEY, INJECT_MODULE_METADATA_KEY} from '../injection'
import {extractConfiguredModuleTerm} from '../util'

export class Module<Cfg = any> {
  public static readonly __svt_module_traits: Array<string> = []

  protected initialized = false

  protected readonly factoriesSync = new Map<TBindKey, ISyncFactory<any>>()
  protected readonly factoriesAsync = new Map<TBindKey, IAsyncFactory<any>>()
  protected readonly aliases = new Map<TBindKey, TBindKey>()
  protected readonly bindManger: BindManager<this> = new BindManager(this)

  protected readonly exports: Set<TBindKey> = new Set()

  protected readonly imports: Set<TClassConstructor<Module>> = new Set()

  protected readonly importedDynamicModules = new Set<Module>()

  constructor(
    protected container: Container,
    protected readonly config?: Cfg,
  ) {
  }

  /**
   * This method invokes user defined bindings, imports, export and internal module related init logic.
   * Any entity initialization logic should be placed in corresponded factory to minimize module initialization time.
   */
  public async setup(): Promise<void> {
  }

  /**
   * Returns container
   */
  public getContainer(): Container {
    return this.container
  }

  public getModuleConfig() {
    return this.config
  }

  /**
   * Returns bind manager (aka bind util)
   */
  get bind() {
    return this.bindManger
  }

  /**
   * Binds sync factory to key
   * @param key
   * @param factory
   */
  public bindSync<F extends ISyncFactory<any>>(key: TBindKey, factory: F) {
    if (!key) {
      throw new ModuleBindingError(this, key, `Cannot bind empty key in module ${getModuleName(this)}`)
    }

    if (this.factoriesAsync.has(key) || (this.aliases.has(key) && this.factoriesAsync.has(this.aliases.get(key)!))) {
      throw new ModuleBindingError(this, key, `Cannot bind ${bindingKeyToString(key)} as sync because it is already bound as async in module ${getModuleName(this)}}. You should drop it with dropBinding(key) before binding it as sync`)
    }

    this.factoriesSync.set(key, factory)

    return factory.makeBindContext(this, key)
  }

  /**
   * Binds async factory to key
   * @param key
   * @param factory
   */
  public bindAsync<F extends IAsyncFactory<any>>(key: TBindKey, factory: F) {
    if (!key) {
      throw new ModuleBindingError(this, key, `Cannot bind empty key in module ${getModuleName(this)}`)
    }

    if (this.factoriesSync.has(key) || (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!))) {
      throw new ModuleBindingError(this, key, `Cannot bind ${bindingKeyToString(key)} as async because it is already bound as sync in container ${getModuleName(this)}}. You should drop it with dropBinding(key) before binding it as async`)
    }

    this.factoriesAsync.set(key, factory)

    return factory.makeBindContext(this, key)
  }

  /**
   * Returns sync entity factory by given key.
   * It will try to find factory from the current module, then from imported modules and finally from global exports.
   * @param key
   */
  public getSyncFactory<
    T = any,
    F extends ISyncFactory<T, Module> = ISyncFactory<T, Module>,
  >(key: TBindKey): [F, Module] {

    if (this.factoriesAsync.has(key) || (this.aliases.has(key) && this.factoriesAsync.has(this.aliases.get(key)!))) {
      throw makeAsyncToSyncProvidingError(this, key)
    }

    // resolve alias only if current key not exists in bindings
    if (!this.factoriesSync.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (this.factoriesSync.has(key)) {
      return [
        this.factoriesSync.get(key) as F,
        this,
      ]
    }

    // search for binding in imported modules
    for (const module of this.getSourceModuleInstances()) {
      if (module instanceof Container) {
        if (module.hasSyncBinding(key)) {
          return module.getSyncModuleFactory<T, Module, F>(key)
        } else {
          continue
        }
      }

      if (module.hasExportedSyncBinding(key)) {
        return module.getSyncFactory(key)
      }
    }

    throw makeNoBindingError(this, key)
  }

  /**
   * Returns async entity factory by given key.
   * It will try to find factory from the current module, then from imported modules and finally from global exports.
   * It will also try to resolve sync binding if async binding is not found.
   * @param key
   */
  public getAsyncFactory<
    T = any,
    F extends IAsyncFactory<T, Module> = IAsyncFactory<T, Module>
  >(key: TBindKey): [F, Module] {

    // if sync factory exists, return it
    if (this.factoriesSync.has(key) || (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!))) {
      return this.getSyncFactory(key)
    }

    // resolve alias only if current key not exists in bindings
    if (!this.factoriesAsync.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (this.factoriesAsync.has(key)) {
      return [
        this.factoriesAsync.get(key) as F,
        this,
      ]
    }

    // search for binding in imported and global modules
    for (const module of this.getSourceModuleInstances()) {
      if (module instanceof Container) {
        if (module.hasAsyncBinding(key)) {
          return module.getAsyncModuleFactory<T, Module, F>(key)
        } else {
          continue
        }
      }

      if (module.hasExportedAsyncBinding(key)) {
        return module.getAsyncFactory(key)
      }
    }

    // fallback to sync
    try {
      return this.getSyncFactory(key)
    } catch (_) {
      // ignore
    }

    throw makeNoBindingError(this, key)
  }

  /**
   * Returns resolved entity by given sync binding or binding ref.
   * It will try to find binding from the current module, then from imported modules and finally from global exports.
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
    const [factory, module] = this.getSyncFactory(key)

    if (!ctx.chain.length) {
      ctx.chain = [
        {module: this, key, factory},
      ]
    }

    ctx = {
      key: key,
      chain: [
        ...ctx.chain,
        {module: factory.getModule(), key, factory},
      ],
    }

    return factory.get(module, options, ctx)
  }

  /**
   * Returns resolved entity by given async binding or binding ref.
   * It will try to find binding from the current module, then from imported modules and finally from global exports.
   * It will also try to resolve sync binding if async binding is not found.
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
    const [factory, module] = this.getAsyncFactory(key)

    if (!ctx.chain.length) {
      ctx.chain = [
        {module: this, key, factory},
      ]
    }

    ctx = {
      key: key,
      chain: [
        ...ctx.chain,
        {module: factory.getModule(), key, factory},
      ],
    }

    return await factory.get(module, options, ctx)
  }

  /**
   * Returns module instances which can be used for resolving bindings in this module
   */
  protected* getSourceModuleInstances() {

    for (const mod of this.imports) {
      yield this.container.getModule(mod)
    }

    yield* this.importedDynamicModules

    yield this.container
    yield* this.container.getDynamicModules()
  }

  public hasOwnBindOrAlias(key: TBindKey) {
    return this.factoriesSync.has(key) || this.factoriesAsync.has(key) || this.aliases.has(key)
  }

  public hasOwnAlias(key: TBindKey) {
    return this.aliases.has(key)
  }

  public hasOwnBind(key: TBindKey) {
    return this.factoriesSync.has(key) || this.factoriesAsync.has(key)
  }

  public hasOwnSyncBind(key: TBindKey) {
    return this.factoriesSync.has(key)
  }

  public hasOwnAsyncBind(key: TBindKey) {
    return this.factoriesAsync.has(key)
  }

  public getOwnAlias(key: TBindKey) {
    return this.aliases.get(key)
  }

  /**
   * Returns true if sync binding is imported from other modules.
   * @param key
   */
  public hasImportedSyncBinding(key: TBindKey) {
    for (const mod of this.getSourceModuleInstances()) {
      if (mod instanceof Container) {
        if (mod.hasSyncBinding(key)) {
          return true
        } else {
          continue
        }
      }

      if (mod !== this && mod.hasExportedSyncBinding(key)) {
        return true
      }
    }

    return false
  }

  /**
   * Returns true if async (or sync) binding is imported from other modules.
   * @see Module.import
   * @param key
   */
  public hasImportedAsyncBinding(key: TBindKey) {
    for (const mod of this.getSourceModuleInstances()) {
      if (mod instanceof Container) {
        if (mod.hasAsyncBinding(key)) {
          return true
        } else {
          continue
        }
      }

      if (mod !== this && mod.hasExportedAsyncBinding(key)) {
        return true
      }
    }

    return false
  }

  /**
   * Returns true if binding is exported from this module.
   * @param key
   */
  public hasExportedSyncBinding(key: TBindKey) {
    if (!this.exports.has(key)) {
      return false
    }

    if (this.factoriesSync.has(key)) {
      return true
    }

    if (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!)) {
      return true
    }

    if (this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    return this.hasImportedSyncBinding(key)
  }

  /**
   * Returns true if binding is exported from this module.
   * Also includes sync imports check.
   * @param key
   */
  public hasExportedAsyncBinding(key: TBindKey) {
    if (!this.exports.has(key)) {
      return false
    }

    // async checks
    if (this.factoriesAsync.has(key)) {
      return true
    }

    if (this.aliases.has(key) && this.factoriesAsync.has(this.aliases.get(key)!)) {
      return true
    }

    // fallback to async
    if (this.factoriesSync.has(key)) {
      return true
    }

    if (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!)) {
      return true
    }

    if (this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    // check imported modules
    return this.hasImportedAsyncBinding(key)
  }

  /**
   * Defines binding or reference to binding export from this module
   * @param keys
   */
  public export(keys: TBindKey | Array<TBindKey>) {
    keys = Array.isArray(keys) ? keys : [keys]

    for (const key of keys) {
      const boundHere = this.aliases.has(key) || this.factoriesSync.has(key) || this.factoriesAsync.has(key)
      // async check also includes a sync check
      let importedFromOther = this.hasImportedAsyncBinding(key)

      if (!boundHere && !importedFromOther) {
        throw new ModuleError(
          this,
          `Cannot export ${bindingKeyToString(key)} because it is not bound in module ${getModuleName(this)} and not imported from other modules`,
        )
      }

      this.exports.add(key)
    }
  }

  /**
   * Defines binding or reference to binding global export from this module.
   * This binding will be available in all modules and by calling `provide*` methods in container.
   * @param keys
   */
  public exportGlobal(keys: TBindKey | Array<TBindKey>) {
    keys = Array.isArray(keys) ? keys : [keys]

    for (const key of keys) {
      const boundHere = this.aliases.has(key) || this.factoriesSync.has(key) || this.factoriesAsync.has(key)
      // async check also includes a sync check
      let importedFromOther = this.hasImportedAsyncBinding(key)

      if (!boundHere && !importedFromOther) {
        throw new ModuleError(
          this,
          `Cannot export ${bindingKeyToString(key)} globally because it is not bound in module ${getModuleName(this)} and not imported from other modules`,
        )
      }

      this.container.registerGlobalBindingRef(this, key)
    }
  }

  /**
   * Defines an alias (aka link) to another binding.
   * Alias can be used in export and global export to achieve global "scoped" bindings for dynamic modules.
   * (see `@silvertree/logging` for usage example)
   * @param key
   * @param aliasKey
   */
  public alias(key: TBindKey, aliasKey: TBindKey) {

    // resolve alias only if current key exists in bindings or imported from modules
    // async check also includes a sync check
    if (!this.hasOwnBind(key) && !this.hasImportedAsyncBinding(key)) {
      throw new ModuleBindingError(
        this,
        key,
        `Binding "${bindingKeyToString(key)}" not found in own bindings or aliases of module ${getModuleName(this)}`,
      )
    }

    this.aliases.set(aliasKey, key)
  }

  /**
   * Returns all aliases pointing to the binding key
   * @param key
   */
  public getAliasesPointingTo(key: TBindKey) {
    const pointingAliases: Array<TBindKey> = []

    for (const [from, to] of this.aliases.entries()) {
      if (to === key) {
        pointingAliases.push(from)
      }
    }

    return pointingAliases
  }

  /**
   * Imports modules into current the current module.
   * All exported bindings (and/or its aliases) will be available in the current module.
   * @param modules
   */
  public async import(
    modules:
      | TClassConstructor<Module>
      | TConfiguredModuleTerm<Module, Container, this, any>
      | Array<TClassConstructor<Module> | TConfiguredModuleTerm<Module, Container, this, any>>,
  ) {
    const modArray = !Array.isArray(modules)
      ? [modules]
      : modules

    const modulesToRegister: Array<TConfiguredModuleTerm<any, any, any, any> | TClassConstructor<Module>> = []

    await Promise.all(modArray.map(async (rawMod) => {

      const [module, configure] = extractConfiguredModuleTerm(rawMod)

      if (isSvtModuleHasTrait(module, 'fiber')) {
        throw new ModuleError(this, `Cannot import ${getModuleName(module)} module because its a FiberModule`)
      }

      if (isSvtModuleHasTrait(module, 'dynamic')) {
        const config = configure ? await configure(this.container, this) : null

        const instance = new module(this.container, config)
        this.importedDynamicModules.add(instance)
        // @ts-ignore
        instance.setImporter(this)
        await instance.init()

      } else {
        this.imports.add(module)
        modulesToRegister.push(rawMod)
      }

    }))

    await this.container.registerBatch(modulesToRegister)
  }

  /**
   * Initializes module
   */
  public async init(): Promise<unknown> {
    if (this.initialized) {
      return
    }

    this.initialized = true

    await this.setupDefaultBindings()
    await this.setup()

    return
  }

  /**
   * Defines basic bindings such as module config, container, etc.
   */
  protected async setupDefaultBindings() {
    // provide module config
    this.bind.syncFunctional(INJECT_MODULE_CONFIG_METADATA_KEY, () => this.config, {singleton: false})

    // provide current module
    this.bind.syncFunctional(INJECT_MODULE_METADATA_KEY, () => this, {singleton: false})
      .alias([Module as TBindKey, this.constructor as TBindKey])
  }
}

