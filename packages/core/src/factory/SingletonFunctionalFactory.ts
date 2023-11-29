import {AbstractAsyncFactory, AbstractSyncFactory} from './AbstractFactory'
import {Module} from '../module'
import {EMPTY_META_TARGET} from '../injection'
import {IInjectOptions, TProvideContext} from '../types'

/**
 * A factory that creates a single instance of a value.
 */
export class SyncFunctionalFactory<T, M extends Module = Module>
  extends AbstractSyncFactory<T, M> {

  protected value?: T

  public constructor(
    module: M,
    protected readonly func: (module: M, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => T,
    protected readonly singleton: boolean = true,
    name?: string,
    description?: string,
  ) {
    super(module, name, description)
  }

  public get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T {
    if (!this.singleton) {
      return this.func(module, options, ctx)
    }

    if (!this.value) {
      this.value = this.func(module, options, ctx)
    }

    return this.value
  }

  public getMetadataTarget(module: M): any {
    return EMPTY_META_TARGET
  }
}

/**
 * A factory that creates a single instance of a value.
 */
export class AsyncFunctionalFactory<T, M extends Module = Module>
  extends AbstractAsyncFactory<Promise<T> | T, M> {

  protected value?: T

  public constructor(
    module: M,
    protected readonly func: (module: M, options: Partial<IInjectOptions> | null, ctx: TProvideContext) => Promise<T> | T,
    protected readonly singleton: boolean = true,
    name?: string,
    description?: string,
  ) {
    super(module, name, description)
  }

  public async get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T> {
    if (!this.singleton) {
      return this.func(module, options, ctx)
    }

    if (!this.value) {
      this.value = await this.func(module, options, ctx)
    }

    return this.value
  }

  public getMetadataTarget(module: M): any {
    return EMPTY_META_TARGET
  }
}
