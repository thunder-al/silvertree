import {Container} from '../container'
import {AbstractAsyncFactory, AbstractSyncFactory} from '../factory/AbstractSyncFactory'
import {BindManager} from './BindManager'
import {makeNoBindingError, ModuleBindingError, ModuleError} from './exceptions'
import {bindingKeyToString, getModuleName} from './util'
import {IInjectOptions, TBindKey, TClassConstructor, TProvideContext} from '../types'

export abstract class Module<Cfg = any> {

  protected readonly factoriesSync = new Map<TBindKey, AbstractSyncFactory<any>>()
  protected readonly factoriesAsync = new Map<TBindKey, AbstractAsyncFactory<any>>()
  protected readonly aliases = new Map<TBindKey, TBindKey>()
  protected readonly bindManger = new BindManager(this)

  protected readonly exports: Set<TBindKey> = new Set()

  protected readonly imports: Set<TClassConstructor<Module>> = new Set()

  constructor(
    protected container: Container,
    protected readonly config: Cfg,
  ) {
  }

  public async setup(): Promise<void> {
  }

  /**
   * Returns container
   */
  public getContainer(): Container {
    return this.container
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
  public bindSync<T, F extends AbstractSyncFactory<T>>(key: TBindKey, factory: F) {
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
  public bindAsync<T, F extends AbstractAsyncFactory<T>>(key: TBindKey, factory: F) {
    if (this.factoriesSync.has(key) || (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!))) {
      throw new ModuleBindingError(this, key, `Cannot bind ${bindingKeyToString(key)} as async because it is already bound as sync in container ${getModuleName(this)}}. You should drop it with dropBinding(key) before binding it as async`)
    }

    this.factoriesAsync.set(key, factory)

    return factory.makeBindContext(this, key)
  }

  /**
   * Drops binding by key
   * @param key
   */
  public dropBinding(key: TBindKey) {
    if (!this.factoriesSync.delete(key) && !this.factoriesAsync.delete(key) && !this.aliases.delete(key)) {
      throw makeNoBindingError(this, key)
    }
  }

  public getSyncFactory<
    T = any,
    F extends AbstractSyncFactory<T, this> = AbstractSyncFactory<T, this>
  >(key: TBindKey): F {

    if (this.factoriesAsync.has(key) || (this.aliases.has(key) && this.factoriesAsync.has(this.aliases.get(key)!))) {
      throw new ModuleBindingError(this, key, `Cannot get async factory ${bindingKeyToString(key)} as sync in module ${getModuleName(this)}. Use async method instead sync variant`)
    }

    // resolve alias only if current key not exists in bindings
    if (!this.factoriesSync.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (this.factoriesSync.has(key)) {
      return this.factoriesSync.get(key) as F
    }

    // search for binding in imported modules
    const importedAndGlobal = [...this.imports, ...this.container.getGlobalModules()]
    for (const moduleClass of importedAndGlobal) {
      const module = this.container.getModule(moduleClass)
      if (module.hasExportedSyncBind(key)) {
        return module.getSyncFactory(key)
      }
    }

    throw makeNoBindingError(this, key)
  }

  public getAsyncFactory<
    T = any,
    F extends AbstractAsyncFactory<T, this> = AbstractAsyncFactory<T, this>
  >(key: TBindKey): F {

    // if sync factory exists, return it
    if (this.factoriesSync.has(key) || (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!))) {
      return this.getSyncFactory(key)
    }

    // resolve alias only if current key not exists in bindings
    if (!this.factoriesAsync.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (this.factoriesAsync.has(key)) {
      return this.factoriesAsync.get(key) as F
    }

    // search for binding in imported and global modules
    const importedAndGlobal = [...this.imports, ...this.container.getGlobalModules()]
    for (const moduleClass of importedAndGlobal) {
      const module = this.container.getModule(moduleClass)
      if (module.hasExportedAsyncBind(key)) {
        return module.getAsyncFactory(key)
      }
    }

    throw makeNoBindingError(this, key)
  }

  public provideSync<T>(key: TClassConstructor<T>, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): T
  public provideSync<T>(key: string | symbol, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): T
  public provideSync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): T {
    const factory = this.getSyncFactory(key)

    ctx = {
      key: key,
      chain: [
        ...ctx.chain,
        {module: factory.getModule(), key, factory},
      ],
    }

    return factory.get(this, options, ctx)
  }

  public provideAsync<T>(key: TClassConstructor<T>, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): Promise<T>
  public provideAsync<T>(key: string | symbol, options?: Partial<IInjectOptions> | null, ctx?: TProvideContext): Promise<T>
  public async provideAsync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): Promise<T> {
    const factory = this.getAsyncFactory(key)

    ctx = {
      key: key,
      chain: [
        ...ctx.chain,
        {module: factory.getModule(), key, factory},
      ],
    }

    return await factory.get(this, options, ctx)
  }

  public hasOwnBindOrAlias(key: TBindKey) {
    return this.factoriesSync.has(key) || this.factoriesAsync.has(key)
  }

  public hasOwnBind(key: TBindKey) {
    return this.factoriesSync.has(key) || this.factoriesAsync.has(key) || this.aliases.has(key)
  }

  public hasImportedSyncBinding(key: TBindKey) {
    const importedAndGlobal = [...this.imports, ...this.container.getGlobalModules()]
    for (const modClass of importedAndGlobal) {
      const mod = this.container.getModule(modClass)
      if (mod.hasExportedSyncBind(key)) {
        return true
      }
    }

    return false
  }

  public hasImportedAsyncBinding(key: TBindKey) {
    const importedAndGlobal = [...this.imports, ...this.container.getGlobalModules()]
    for (const modClass of importedAndGlobal) {
      const mod = this.container.getModule(modClass)
      if (mod.hasExportedAsyncBind(key)) {
        return true
      }
    }

    return false
  }

  public hasExportedSyncBind(key: TBindKey) {
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

  public hasExportedAsyncBind(key: TBindKey) {
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

  public getAliasesPointingTo(key: TBindKey) {
    const pointingAliases: Array<TBindKey> = []

    for (const [from, to] of this.aliases.entries()) {
      if (to === key) {
        pointingAliases.push(from)
      }
    }

    return pointingAliases
  }

  public async import<M extends Module>(modules: TClassConstructor<M> | Array<TClassConstructor<M>>) {
    modules = Array.isArray(modules) ? modules : [modules]

    for (const module of modules) {
      this.imports.add(module)
    }

    await Promise.all(modules.map(module => this.container.register(module)))
  }

  /**
   * Initializes module
   */
  async init(): Promise<unknown> {
    await this.setup()
    return
  }

  /**
   * Returns true if module is global
   */
  public isGlobal() {
    return false
  }
}
