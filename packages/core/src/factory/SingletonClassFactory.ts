import {IAsyncFactory, ISyncFactory} from './Factory'
import {Module} from '../module'
import {IInjectOptions, TBindKey, TClassConstructor, TProvideContext} from '../types'
import {
  getBindingArgumentsForClassMethodAsync,
  getBindingArgumentsForClassMethodSync,
  injectBindingsForClassParameterAsync,
  injectBindingsForClassParameterSync,
} from '../injection'
import {FactoryBindContext} from './FactoryBindContext'

export interface SingletonClassSyncFactoryHooks<T, M extends Module = Module> {
  constructed: (instance: T, module: M) => unknown
  done: (instance: T, module: M) => unknown
}

/**
 * A factory that creates a single instance of a class.
 */
export class SingletonClassSyncFactory<T, M extends Module = Module>
  implements ISyncFactory<T, M> {

  protected value?: T
  protected hooks = new Map<keyof SingletonClassSyncFactoryHooks<T, M>, Set<Function>>()

  public constructor(
    protected readonly module: M,
    protected readonly cls: TClassConstructor<T>,
  ) {
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

      // call hooks "constructed"
      if (this.hooks.has('constructed')) {
        for (const hook of this.hooks.get('constructed')!) {
          hook(instance)
        }
      }

      // inject properties
      injectBindingsForClassParameterSync(
        module,
        instance,
        ctx,
      )

      // call hooks "done"
      if (this.hooks.has('done')) {
        for (const hook of this.hooks.get('done')!) {
          hook(instance)
        }
      }

      return instance
    }

    return this.value
  }

  public on<
    C extends keyof SingletonClassSyncFactoryHooks<T, M>
  >(event: C, callback: SingletonClassSyncFactoryHooks<T, M>[C]): this {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Set())
    }

    this.hooks.get(event)!.add(callback)

    return this
  }

  public getModule(): M {
    return this.module
  }

  public makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this> {
    return new FactoryBindContext(module, key, this)
  }
}

export interface SingletonClassAsyncFactoryHooks<T, M extends Module = Module> {
  constructed: (instance: T, module: M) => Promise<unknown> | unknown
  done: (instance: T, module: M) => Promise<unknown> | unknown
}

/**
 * A factory that creates a single instance of a class.
 */
export class SingletonClassAsyncFactory<T, M extends Module = Module>
  implements IAsyncFactory<Promise<T> | T, M> {

  protected value?: T
  protected hooks = new Map<keyof SingletonClassAsyncFactoryHooks<T, M>, Set<Function>>()
  protected promise?: Promise<T>

  public constructor(
    protected readonly module: M,
    protected readonly cls: TClassConstructor<T>,
  ) {
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

        // call hooks "constructed"
        if (this.hooks.has('constructed')) {
          for (const hook of this.hooks.get('constructed')!) {
            await hook(instance)
          }
        }

        // inject properties
        await injectBindingsForClassParameterAsync(
          module,
          instance,
          ctx,
        )

        // call hooks "done"
        if (this.hooks.has('done')) {
          for (const hook of this.hooks.get('done')!) {
            await hook(instance)
          }
        }

        resolve(instance)

      } catch (e) {
        reject(e)
      }

      // clear promise to clear memory or prevent same error "stuck"
      this.promise = undefined
    })

    return this.promise
  }

  public getModule(): M {
    return this.module
  }

  public makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, Promise<T> | T, this> {
    return new FactoryBindContext(module, key, this)
  }

  public on<
    C extends keyof SingletonClassAsyncFactoryHooks<T, M>
  >(event: C, callback: SingletonClassAsyncFactoryHooks<T, M>[C]): this {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, new Set())
    }

    this.hooks.get(event)!.add(callback)

    return this
  }
}
