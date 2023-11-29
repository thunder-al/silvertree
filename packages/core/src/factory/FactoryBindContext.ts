import {AbstractAsyncFactory, AbstractSyncFactory} from './AbstractFactory'
import {Module} from '../module'

import {TBindKey} from '../types'

/**
 * Factory bind context.
 * Used to define aliases, exports and other stuff for current factory.
 */
export class FactoryBindContext<
  M extends Module = Module,
  T = any,
  F extends AbstractSyncFactory<T> | AbstractAsyncFactory<T> = AbstractSyncFactory<T> | AbstractAsyncFactory<T>
> {
  constructor(
    protected module: M,
    protected key: TBindKey,
    protected factory: F,
  ) {
  }

  /**
   * Exports current factory.
   * Can be used to export all aliases of this binding or/and mark it as global export.
   * @param opts
   */
  public export(opts?: { withAliases?: boolean, global?: boolean }) {
    const keys = [
      this.key,
    ]

    if (opts?.withAliases) {
      const aliases = this.module.getAliasesPointingTo(this.key)
      keys.push(...aliases)
    }

    for (const key of keys) {
      this.module.export(key)

      if (opts?.global) {
        this.module.exportGlobal(key)
      }
    }

    return this
  }

  /**
   * Adding an alias for current factory.
   * @param aliasKey
   */
  public alias(aliasKey: TBindKey | Array<TBindKey>) {
    if (Array.isArray(aliasKey)) {
      for (const alias of aliasKey) {
        this.module.alias(this.key, alias)
      }
      return this
    }

    this.module.alias(this.key, aliasKey)
    return this
  }

  public getKey() {
    return this.key
  }

  public getFactory() {
    return this.factory
  }

  /**
   * Runs a function with current factory.
   * @param func
   */
  public tapFactory(func: (factory: F) => unknown) {
    func(this.factory)
    return this
  }

  /**
   * Runs an async function with current factory.
   * @param func
   */
  public async tapFactoryAsync(func: (factory: F) => Promise<unknown>): Promise<this> {
    await func(this.factory)
    return this
  }

  public getModule() {
    return this.module
  }

  /**
   * Runs a function with current context.
   * @param func
   */
  public tap(func: (context: this) => unknown) {
    func(this)
    return this
  }

  /**
   * Runs an async function with current context.
   * @param func
   */
  public async tapAsync(func: (context: this) => Promise<unknown>): Promise<this> {
    await func(this)
    return this
  }
}
