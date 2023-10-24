import {Module} from './Module'
import {TBindKey, TClassConstructor} from '../types'


export interface BindManagerImpl {

}

export class BindManager<M extends Module = Module> implements BindManagerImpl {

  constructor(
    protected readonly module: M,
  ) {
  }

  public syncSingleton<T = any>(
    key: TBindKey,
    value: (...injectedArgs: any) => T | TClassConstructor<T>,
  ) {
    // return this.module.bindSync(key, new SyncSingletonFactory())
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
