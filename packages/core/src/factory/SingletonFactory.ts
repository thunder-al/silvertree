import {Container} from '../container/Container'
import {AsyncFactory, defaultFactoryDescription, defaultFactoryName, Factory} from './Factory'
import {TFactoryMetadata} from './types'

export class SingletonFactory<T, M extends TFactoryMetadata = TFactoryMetadata, C extends Container = Container>
  extends Factory<T, M, C> {

  protected value?: T

  public constructor(
    protected func: (container: C) => T,
    protected metaFunc?: (container: C, factory: SingletonFactory<T, M, C>) => M,
    protected name = defaultFactoryName,
    protected description = defaultFactoryDescription,
  ) {
    super()
  }

  public get(container: C): T {
    if (!this.value) {
      this.value = this.func(container)
    }

    return this.value
  }

  public getMetadata(container: C): M {
    return this.metaFunc
      ? this.metaFunc(container, this)
      : {} as any
  }

  public getName(): string {
    return this.name
  }

  public getDescription(): string {
    return this.description
  }

}

export abstract class AsyncSingletonFactory<T, M extends TFactoryMetadata = TFactoryMetadata, C extends Container = Container>
  extends AsyncFactory<T, M, C> {

  protected value?: T

  public constructor(
    protected func: (container: C) => T | Promise<T>,
    protected metaFunc?: (container: C, factory: AsyncSingletonFactory<T, M, C>) => M | Promise<M>,
    protected name = defaultFactoryName,
    protected description = defaultFactoryDescription,
  ) {
    super()
  }

  public async get(container: C): Promise<T> {
    if (!this.value) {
      this.value = await this.func(container)
    }

    return this.value
  }

  public async getMetadata(container: C): Promise<M> {
    return this.metaFunc
      ? await this.metaFunc(container, this)
      : {} as any
  }

  public getName(): string {
    return this.name
  }

  public getDescription(): string {
    return this.description
  }

}
