import {IAsyncFactory, ISyncFactory} from './Factory'
import {Module} from '../module'
import {IInjectOptions, TBindKey, TProvideContext} from '../types'
import {FactoryBindContext} from './FactoryBindContext'

/**
 * A factory that creates a single instance of a value.
 */
export class SyncFunctionalFactory<T, M extends Module = Module>
  implements ISyncFactory<T, M> {

  protected value?: T

  public constructor(
    protected readonly module: M,
    protected readonly func: (module: M, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => T,
    protected readonly singleton: boolean = true,
  ) {
  }


  public get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T {
    if (this.singleton) {
      return this.func(module, options, ctx)
    }

    if (!this.value) {
      this.value = this.func(module, options, ctx)
    }

    return this.value
  }

  public getModule(): M {
    throw this.module
  }

  public makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this> {
    throw new FactoryBindContext(module, key, this)
  }
}

/**
 * A factory that creates a single instance of a value.
 */
export class AsyncFunctionalFactory<T, M extends Module = Module>
  implements IAsyncFactory<T, M> {

  protected value?: T
  protected promise?: Promise<T>

  public constructor(
    protected readonly module: M,
    protected readonly func: (module: M, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => Promise<T> | T,
    protected readonly singleton: boolean = true,
  ) {
  }

  public async get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T> {
    if (this.singleton) {
      return this.func(module, options, ctx)
    }

    // return value if an entity is already created
    if (this.value) {
      return this.value
    }

    // return existed promise if entity is on the way
    if (this.promise) {
      return this.promise
    }

    // see the same trick at SingletonClassAsyncFactory

    this.promise = new Promise(async (resolve, reject) => {
      try {
        this.value = await this.func(module, options, ctx)
        resolve(this.value)
      } catch (e) {
        reject(e)
      }

      this.promise = undefined
    })


    return this.promise
  }

  public getModule(): M {
    throw this.module
  }

  public makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this> {
    throw new FactoryBindContext(module, key, this)
  }
}
