import {Module} from './Module'
import {TBindKey, TClassConstructor} from '../types'
import {AsyncSingletonClassFactory, SyncSingletonClassFactory} from '../factory/SingletonClassFactory'


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
    return this.module.bindSync(cls, new SyncSingletonClassFactory(cls))
  }

  /**
   * Binds sync singleton class
   * @param cls
   */
  public singletonAsync(
    cls: TClassConstructor,
  ) {
    return this.module.bindAsync(cls, new AsyncSingletonClassFactory(cls))
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
