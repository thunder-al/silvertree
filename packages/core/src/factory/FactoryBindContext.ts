import {AbstractAsyncFactory, AbstractSyncFactory} from './AbstractSyncFactory'
import {Module} from '../module'

import {TBindKey} from '../types'

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

  public export() {
    this.module.export(this.key)
    return this
  }

  public alias(aliasKey: TBindKey) {
    this.module.alias(this.key, aliasKey)
    return this
  }

  public getKey() {
    return this.key
  }

  public getFactory() {
    return this.factory
  }

  public tapFactory(func: (factory: F) => unknown) {
    func(this.factory)
    return this
  }

  public async tapFactoryAsync(func: (factory: F) => Promise<unknown>): Promise<this> {
    await func(this.factory)
    return this
  }

  public getModule() {
    return this.module
  }

  public tap(func: (context: this) => unknown) {
    func(this)
    return this
  }

  public async tapAsync(func: (context: this) => Promise<unknown>): Promise<this> {
    await func(this)
    return this
  }
}
