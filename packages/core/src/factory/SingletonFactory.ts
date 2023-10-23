import {AbstractAsyncFactory, defaultFactoryDescription, defaultFactoryName, AbstractFactory} from './AbstractFactory'
import {TFactoryMetadata} from './types'
import {Module} from '../module'

export class SyncSingletonFactory<T, Fm extends TFactoryMetadata = TFactoryMetadata, M extends Module = Module>
  extends AbstractFactory<T, Fm, M> {

  protected value?: T

  public constructor(
    protected func: (module: M) => T,
    protected metaFunc?: (module: M, factory: SyncSingletonFactory<T, Fm, M>) => Fm,
    protected name = defaultFactoryName,
    protected description = defaultFactoryDescription,
  ) {
    super()
  }

  public get(container: M): T {
    if (!this.value) {
      this.value = this.func(container)
    }

    return this.value
  }

  public getMetadata(container: M): Fm {
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

export abstract class AsyncSingletonFactory<T, Fm extends TFactoryMetadata = TFactoryMetadata, M extends Module = Module>
  extends AbstractAsyncFactory<T, Fm, M> {

  protected value?: T

  public constructor(
    protected func: (module: M) => T | Promise<T>,
    protected metaFunc?: (module: M, factory: AsyncSingletonFactory<T, Fm, M>) => Fm | Promise<Fm>,
    protected name = defaultFactoryName,
    protected description = defaultFactoryDescription,
  ) {
    super()
  }

  public async get(container: M): Promise<T> {
    if (!this.value) {
      this.value = await this.func(container)
    }

    return this.value
  }

  public async getMetadata(container: M): Promise<Fm> {
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
