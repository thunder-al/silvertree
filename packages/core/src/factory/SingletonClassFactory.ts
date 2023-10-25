import {AbstractAsyncFactory, AbstractSyncFactory} from './AbstractSyncFactory'
import {Module} from '../module'
import {IInjectOptions, TClassConstructor, TProvideContext} from '../types'
import {
  getBindingArgumentsForClassConstructorAsync,
  getBindingArgumentsForClassConstructorSync,
  injectBindingsForClassParameterAsync,
  injectBindingsForClassParameterSync,
} from '../injection'

/**
 * A factory that creates a single instance of a class.
 */
export class SingletonClassSyncFactory<T, M extends Module = Module>
  extends AbstractSyncFactory<T, M> {

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

      // prepare constructor arguments
      const constructorArgs = getBindingArgumentsForClassConstructorSync(
        module,
        this,
        this.cls,
        options?.constructorArgs ?? {},
        ctx,
      )

      // create instance
      const instance: T = new this.cls(...constructorArgs)

      // save value for future recursive calls
      this.value = instance

      // inject properties
      injectBindingsForClassParameterSync(
        module,
        instance,
        ctx,
      )

      return instance
    }

    return this.value
  }

  public getMetadataTarget(module: M): any {
    return this.cls
  }
}

/**
 * A factory that creates a single instance of a class.
 */
export class SingletonClassAsyncFactory<T, M extends Module = Module>
  extends AbstractAsyncFactory<Promise<T> | T, M> {

  protected value?: T

  public constructor(
    protected cls: TClassConstructor<T>,
    name?: string,
    description?: string,
  ) {
    name = name ?? cls.name
    super(name, description)
  }

  public async get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T> {
    if (!this.value) {

      // prepare constructor arguments
      const constructorArgs = await getBindingArgumentsForClassConstructorAsync(
        module,
        this,
        this.cls,
        options?.constructorArgs ?? {},
        ctx,
      )

      // create instance
      const instance = new this.cls(...constructorArgs)

      // save value for future recursive calls
      this.value = instance

      // inject properties
      await injectBindingsForClassParameterAsync(
        module,
        instance,
        ctx,
      )
    }

    return this.value
  }

  public getMetadataTarget(module: M): any {
    return this.cls
  }
}
