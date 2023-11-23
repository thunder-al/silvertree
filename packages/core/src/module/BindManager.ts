import {Module} from './Module'
import {TBindKey, TClassConstructor} from '../types'
import {SingletonClassAsyncFactory, SingletonClassSyncFactory} from '../factory/SingletonClassFactory'
import {AsyncFunctionalFactory, SyncFunctionalFactory} from '../factory/SingletonFunctionalFactory'


/**
 * Bind manager extension type interface.
 * @example
 * declare module '@sensejs/core' {
 *   interface BindManagerImpl {
 *     myMethod(): string
 *   }
 * }
 */
export interface BindManagerImpl {
}

/**
 * Helper class for binding
 */
export class BindManager<M extends Module = Module> implements BindManagerImpl {

  constructor(
    protected readonly module: M,
  ) {
  }

  /**
   * Binds sync singleton class
   * @param cls
   */
  public syncSingletonClass(
    cls: TClassConstructor,
  ) {
    return this.module.bindSync(cls, new SingletonClassSyncFactory(this.module, cls))
  }

  /**
   * Binds sync singleton class
   * @param cls
   */
  public singletonClass(
    cls: TClassConstructor,
  ) {
    return this.module.bindAsync(cls, new SingletonClassAsyncFactory(this.module, cls))
  }

  /**
   * Binds sync singleton functional
   * @param key
   * @param func
   * @param options
   */
  public syncFunctional(
    key: TBindKey,
    func: (module: M) => unknown,
    options?: { singleton?: boolean },
  ) {
    return this.module.bindSync(key, new SyncFunctionalFactory(this.module, func, options?.singleton ?? true))
  }

  public functional(
    key: TBindKey,
    func: (module: M) => Promise<unknown> | unknown,
    options?: { singleton?: boolean },
  ) {
    return this.module.bindAsync(key, new AsyncFunctionalFactory(this.module, func, options?.singleton ?? true))
  }

  public constant<V>(
    key: TBindKey,
    value: V,
  ) {
    return this.module.bindAsync(key, new SyncFunctionalFactory(this.module, () => value, false))
  }

  /**
   * Extends bind manager with additional method scoped by module.
   * It will not make type for `this.bind` method in controller, you should extend `BindManagerImpl` interface for that.
   *
   * @param methodName
   * @param getter
   * @example
   * class MyMod {
   *   async setup() {
   *     this.bind.extendBindManager('constOne', (manager, key) => manager.constant('one', 1))
   *     this.bind.constOne('test')
   *   }
   * }
   * // TIP: You probably will want to close `extendBindManager` call in a separated function
   * // like `applyBindManagerOneConst(mod: Module) { mod.bind.extendBindManager(...) }`
   * // and call it in `setup` method like `applyBindManagerOneConst(this)`
   */
  public extendBindManager<
    Args extends Array<any>,
    Value,
  >(
    methodName: string,
    getter: (manager: this, ...args: Args) => Value,
  ) {
    Object.defineProperty(this, methodName, {
      value: (args: Args) => getter(this, ...args),
    })
  }

  /**
   * Extends bind manager with globally with additional method.
   * It will not make type for `this.bind` method in controller, you should extend `BindManagerImpl` interface for that.
   *
   * @param methodName
   * @param getter
   * @example js
   * BindManager.extendBindManagerGlobal('constOne', (manager, key) => manager.constant('one', 1))
   * // ...
   * class MyMod {
   *   async setup() {
   *     this.bind.constOne('test')
   *   }
   * }
   */
  public extendBindManagerGlobal<
    Args extends Array<any>,
    Value,
  >(
    methodName: string,
    getter: (manager: this, ...args: Args) => Value,
  ) {
    Object.defineProperty(BindManager.prototype, methodName, {
      value: (args: Args) => getter(this, ...args),
    })
  }
}
