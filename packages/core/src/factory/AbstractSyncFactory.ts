import {FactoryBindContext} from './FactoryBindContext'
import {Module} from '../module'

import {IInjectOptions, TBindKey, TProvideContext} from '../types'

export const defaultFactoryName = '(no-name)'
export const defaultFactoryDescription = '(no-description)'

export abstract class AbstractSyncFactory<
  T,
  M extends Module = Module,
> {

  constructor(
    protected readonly module: M,
    protected factoryName = defaultFactoryName,
    protected factoryDescription = defaultFactoryDescription,
  ) {
  }

  /**
   * Returns injected object
   */
  public abstract get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T

  /**
   * Returns object's metadata
   */
  public abstract getMetadataTarget(module: M): any

  /**
   * Returns factory/object name. For debugging/documentation purposes
   */
  public getName(): string {
    return this.factoryName
  }

  /**
   * Returns factory/object description. For debugging/documentation purposes
   */
  public getDescription(): string {
    return this.factoryDescription
  }

  public makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this> {
    return new FactoryBindContext(module, key, this)
  }

  public getModule(): M {
    return this.module
  }

}

export abstract class AbstractAsyncFactory<T, M extends Module = Module>
  extends AbstractSyncFactory<T | Promise<T>, M> {
}
