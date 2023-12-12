import {AbstractAsyncFactory, AbstractSyncFactory} from './AbstractFactory'
import {Module} from '../module'
import {IInjectOptions, TClassConstructor, TProvideContext} from '../types'
import {
  getBindingArgumentsForClassMethodAsync,
  getBindingArgumentsForClassMethodSync,
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
    module: M,
    protected cls: TClassConstructor<T>,
    name?: string,
    description?: string,
  ) {
    name = name ?? cls.name
    super(module, name, description)
  }

  public get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T {
    if (!this.value) {

      // prepare constructor arguments
      const constructorArgs = getBindingArgumentsForClassMethodSync(
        module,
        this.cls,
        null,
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
  protected promise?: Promise<T>

  public constructor(
    module: M,
    protected cls: TClassConstructor<T>,
    name?: string,
    description?: string,
  ) {
    name = name ?? cls.name
    super(module, name, description)
  }

  public async get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T> {
    // return value if already created
    if (this.value) {
      return this.value
    }

    // return promise if it on the way
    if (this.promise) {
      return this.promise
    }

    // saving promise to prevent multiple class initialization.
    // this promise will be returned above if it is on the way, but didn't produce value yet.
    // aka promise singleton, but with its resolving at the end.

    this.promise = new Promise(async (resolve, reject) => {
      try {
        // prepare constructor arguments
        const constructorArgs = await getBindingArgumentsForClassMethodAsync(
          module,
          this.cls,
          null,
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

        resolve(instance)

      } catch (e) {
        reject(e)
      }

      // clear promise to clear memory or prevent same error "stuck"
      this.promise = undefined
    })

    return this.promise
  }

  public getMetadataTarget(module: M): any {
    return this.cls
  }
}
