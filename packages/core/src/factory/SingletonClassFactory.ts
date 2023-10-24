import {AbstractFactory} from './AbstractFactory'
import {Module} from '../module'
import {TClassConstructor} from '../types'

/**
 * A factory that creates a single instance of a class.
 */
export class SyncSingletonFunctionalFactory<T, M extends Module = Module>
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

  public get(module: M): T {
    if (!this.value) {
      this.value = this.createInstance(module)
    }

    return this.value
  }

  protected createInstance(module: M): T {
    return new this.cls()
  }

  public getMetadataTarget(module: M): any {
    return this.cls
  }
}

/**
 * A factory that creates a single instance of a class.
 */
export abstract class AsyncSingletonClassFactory<T, M extends Module = Module>
  extends SyncSingletonFunctionalFactory<Promise<T> | T, M> {

}
