import {FactoryBindContext} from './FactoryBindContext'
import {Module} from '../module'

import {TBindKey} from '../types'

export const defaultFactoryName = '(no-name)'
export const defaultFactoryDescription = '(no-description)'

export abstract class AbstractFactory<
  T,
  M extends Module = Module,
> {

  constructor(
    protected factoryName = defaultFactoryName,
    protected factoryDescription = defaultFactoryDescription,
  ) {
  }

  /**
   * Returns injected object
   */
  public abstract get(container: M): T

  /**
   * Returns object's metadata
   */
  public abstract getMetadataTarget(container: M): any

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

}

export abstract class AbstractAsyncFactory<T, M extends Module = Module>
  extends AbstractFactory<T | Promise<T>, M> {
}
