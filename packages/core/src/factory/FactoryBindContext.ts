import {AsyncFactory, Factory} from './Factory'
import {Container} from '../container/Container'
import {TContainerKey} from '../container/types'

export class FactoryBindContext<
  C extends Container = Container,
  T = any,
  F extends Factory<T> | AsyncFactory<T> = Factory<T> | AsyncFactory<T>
> {
  constructor(
    protected container: C,
    protected key: TContainerKey,
    protected factory: F,
  ) {
  }

  public export() {
    this.container.export(this.key)
    return this
  }

  public alias(aliasKey: TContainerKey) {
    this.container.alias(this.key, aliasKey)
    return this
  }

  public getKey() {
    return this.key
  }

  public getFactory() {
    return this.factory
  }

  public tapFactory(func: (factory: F) => unknown) {
    func(this.getFactory())
    return this
  }

  public getContainer() {
    return this.container
  }

  public tap(func: (context: this) => unknown) {
    func(this)
    return this
  }
}
