import {Module} from './Module'
import {TBindKey, TClassConstructor} from '../types'
import {SingletonClassAsyncFactory, SingletonClassSyncFactory} from '../factory/SingletonClassFactory'
import {AsyncSingletonFunctionalFactory, SyncSingletonFunctionalFactory} from '../factory/SingletonFunctionalFactory'


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
    return this.module.bindSync(cls, new SingletonClassSyncFactory(cls))
  }

  /**
   * Binds sync singleton class
   * @param cls
   */
  public singletonClass(
    cls: TClassConstructor,
  ) {
    return this.module.bindAsync(cls, new SingletonClassAsyncFactory(cls))
  }

  /**
   * Binds sync singleton functional
   * @param key
   * @param func
   */
  public syncSingletonFunctional(
    key: TBindKey,
    func: (module: M) => unknown,
  ) {
    return this.module.bindSync(key, new SyncSingletonFunctionalFactory(func))
  }

  public singletonFunctional(
    key: TBindKey,
    func: (module: M) => Promise<unknown> | unknown,
  ) {
    return this.module.bindAsync(key, new AsyncSingletonFunctionalFactory(func))
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
