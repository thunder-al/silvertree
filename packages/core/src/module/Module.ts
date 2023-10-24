import {Container} from '../container'
import {AbstractAsyncFactory, AbstractFactory} from '../factory/AbstractFactory'
import {BindManager} from './BindManager'
import {makeNoBindingError, ModuleBindingError} from './exceptions'
import {assertOwnBinding, bindingKeyToString, getModuleName} from './util'
import {IInjectOptions, TBindKey, TClassConstructor, TProvideContext} from '../types'

export abstract class Module<Cfg = any> {

  public readonly factoriesSync = new Map<TBindKey, AbstractFactory<any>>()
  protected readonly factoriesAsync = new Map<TBindKey, AbstractAsyncFactory<any>>()
  protected readonly aliases = new Map<TBindKey, TBindKey>()
  protected readonly bindManger = new BindManager(this)

  protected exports: Set<TBindKey> = new Set()

  protected imports: Set<TClassConstructor<Module>> = new Set()

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
  public bindSync<T, F extends AbstractFactory<T>>(key: TBindKey, factory: F) {
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
    F extends AbstractFactory<T, this> = AbstractFactory<T, this>
  >(key: TBindKey) {

    if (this.factoriesAsync.has(key) || (this.aliases.has(key) && this.factoriesAsync.has(this.aliases.get(key)!))) {
      throw new ModuleBindingError(this, key, `Cannot get async factory ${bindingKeyToString(key)} as sync in module ${getModuleName(this)}. Use async method instead sync variant`)
    }

    // resolve alias only if current key not exists in bindings
    if (!this.factoriesSync.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (!this.factoriesSync.has(key)) {
      throw makeNoBindingError(this, key)
    }

    return this.factoriesSync.get(key) as F
  }

  public getAsyncFactory<
    T = any,
    F extends AbstractAsyncFactory<T, this> = AbstractAsyncFactory<T, this>
  >(key: TBindKey) {

    // if sync factory exists, return it
    if (this.factoriesSync.has(key) || (this.aliases.has(key) && this.factoriesSync.has(this.aliases.get(key)!))) {
      return this.getSyncFactory(key)
    }

    // resolve alias only if current key not exists in bindings
    if (!this.factoriesAsync.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (!this.factoriesAsync.has(key)) {
      throw makeNoBindingError(this, key)
    }

    return this.factoriesAsync.get(key) as F
  }

  public provideSync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): T {
    const factory = this.getSyncFactory(key)

    ctx = {
      ...ctx,
      key: key,
      chain: [
        ...ctx.chain,
        {module: this, key, factory},
      ],
    }

    return factory.get(this, options, ctx)
  }

  public async provideAsync<T>(
    key: TBindKey,
    options: Partial<IInjectOptions> | null = null,
    ctx: TProvideContext = {chain: [], key},
  ): Promise<T> {
    const factory = this.getAsyncFactory(key)

    return await factory.get(this, options, ctx)
  }

  public hasOwnBindOrAlias(key: TBindKey) {
    return this.factoriesSync.has(key) || this.factoriesAsync.has(key)
  }

  public hasOwnBind(key: TBindKey) {
    return this.factoriesSync.has(key) || this.factoriesAsync.has(key) || this.aliases.has(key)
  }

  public export(key: TBindKey) {
    this.exports.add(key)
  }

  public alias(key: TBindKey, aliasKey: TBindKey) {
    assertOwnBinding(this, key)
    this.aliases.set(aliasKey, key)
  }

  public import<M extends Module>(module: TClassConstructor<M>) {
    this.imports.add(module)
  }

  /**
   * Initializes module
   */
  async init(): Promise<unknown> {
    await this.setup()
    return
  }
}
