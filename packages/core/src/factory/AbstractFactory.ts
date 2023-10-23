import {FactoryBindContext} from './FactoryBindContext'
import {TFactoryMetadata} from './types'
import {Module} from '../module'
import {TBindKey} from '../module/types'

export const defaultFactoryName = '(no-name)'
export const defaultFactoryDescription = '(no-description)'

export abstract class AbstractFactory<
  T,
  Fm extends TFactoryMetadata = TFactoryMetadata,
  M extends Module = Module,
> {

  /**
   * Returns injected object
   */
  public abstract get(container: M): T

  /**
   * Returns object's metadata
   */
  public abstract getMetadata(container: M): Fm

  /**
   * Returns factory/object name. For debugging/documentation purposes
   */
  public getName(): string {
    return defaultFactoryName
  }

  /**
   * Returns factory/object description. For debugging/documentation purposes
   */
  public getDescription(): string {
    return defaultFactoryDescription
  }

  public makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this> {
    return new FactoryBindContext(module, key, this)
  }

}

export abstract class AbstractAsyncFactory<T, Fm extends TFactoryMetadata = TFactoryMetadata, M extends Module = Module>
  extends AbstractFactory<T | Promise<T>, Fm | Promise<Fm>, M> {

  public abstract get(container: M): T | Promise<T>

  public abstract getMetadata(container: M): Fm | Promise<Fm>

}
