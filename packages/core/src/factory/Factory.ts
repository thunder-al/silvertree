import {Container} from '../container/Container'
import {FactoryBindContext} from './FactoryBindContext'
import {TContainerKey} from '../container/types'
import {TFactoryMetadata} from './types'

export const defaultFactoryName = '(no-name)'
export const defaultFactoryDescription = '(no-description)'

export abstract class Factory<
  T,
  M extends TFactoryMetadata = TFactoryMetadata,
  C extends Container = Container,
> {

  /**
   * Returns injected object
   */
  public abstract get(container: C): T

  /**
   * Returns object's metadata
   */
  public abstract getMetadata(container: C): M

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

  public makeBindContext(container: C, key: TContainerKey): FactoryBindContext<C, T, this> {
    return new FactoryBindContext(container, key, this)
  }

}

export abstract class AsyncFactory<T, M extends TFactoryMetadata = TFactoryMetadata, C extends Container = Container>
  extends Factory<T | Promise<T>, M | Promise<M>> {

  public abstract get(container: C): T | Promise<T>

  public abstract getMetadata(container: C): M | Promise<M>

}
