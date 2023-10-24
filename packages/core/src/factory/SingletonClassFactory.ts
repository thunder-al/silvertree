import {AbstractFactory} from './AbstractFactory'
import {Module} from '../module'
import {IInjectOptions, TClassConstructor, TProvideContext} from '../types'
import {getBindingArgumentsForClassConstructorAsync, getBindingArgumentsForClassConstructorSync} from '../injection'

/**
 * A factory that creates a single instance of a class.
 */
export class SyncSingletonClassFactory<T, M extends Module = Module>
  extends AbstractFactory<T, M> {

  protected value?: T

  public constructor(
    protected cls: TClassConstructor<T>,
    name?: string,
    description?: string,
  ) {
    name = name ?? cls.name
    super(name, description)
  }

  public get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T {
    if (!this.value) {
      this.value = this.createInstance(module, options, ctx)
    }

    return this.value
  }

  protected createInstance(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T {

    const args = getBindingArgumentsForClassConstructorSync(
      module,
      this,
      this.cls,
      options?.constructorArgs ?? {},
      ctx,
    )

    const instance = new this.cls(...args)

    return instance
  }

  public getMetadataTarget(module: M): any {
    return this.cls
  }
}

/**
 * A factory that creates a single instance of a class.
 */
export class AsyncSingletonClassFactory<T, M extends Module = Module>
  extends SyncSingletonClassFactory<Promise<T> | T, M> {

  public constructor(
    cls: TClassConstructor<T>,
    name?: string,
    description?: string,
  ) {
    name = name ?? cls.name
    super(cls, name, description)
  }

  public async get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T> {
    if (!this.value) {
      this.value = this.createInstance(module, options, ctx)
    }

    return this.value
  }

  protected async createInstance(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T> {

    const args = await getBindingArgumentsForClassConstructorAsync(
      module,
      this,
      this.cls,
      options?.constructorArgs ?? {},
      ctx,
    )

    const instance = new this.cls(...args)

    return instance
  }

}
