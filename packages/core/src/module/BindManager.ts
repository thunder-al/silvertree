import {Module} from './Module'
import {TBindKey, TClassConstructor} from '../types'
import {SingletonClassAsyncFactory, SingletonClassSyncFactory} from '../factory/SingletonClassFactory'
import {AsyncFunctionalFactory, SyncFunctionalFactory} from '../factory/SingletonFunctionalFactory'


export interface BindManagerImpl {

}

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

  public extendBindManager(methodName: string, getter: Function) {
    Object.defineProperty(this, methodName, {
      value: getter,
    })
  }

  public extendBindManagerGlobal(methodName: string, getter: Function) {
    Object.defineProperty(BindManager.prototype, methodName, {
      value: getter,
    })
  }
}
