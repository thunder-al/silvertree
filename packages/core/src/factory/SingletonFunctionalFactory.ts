import {AbstractFactory} from './AbstractFactory'
import {Module} from '../module'
import {EMPTY_META_TARGET} from '../injection'

/**
 * A factory that creates a single instance of a value.
 */
export class SyncSingletonFunctionalFactory<T, M extends Module = Module>
  extends AbstractFactory<T, M> {

  protected value?: T

  public constructor(
    protected singletonFunc: (module: M) => T,
    name?: string,
    description?: string,
  ) {
    super(name, description)
  }

  public get(container: M): T {
    if (!this.value) {
      this.value = this.singletonFunc(container)
    }

    return this.value
  }

  public getMetadataTarget(container: M): any {
    return EMPTY_META_TARGET
  }
}

/**
 * A factory that creates a single instance of a value.
 */
export class AsyncSingletonFunctionalFactory<T, M extends Module = Module>
  extends SyncSingletonFunctionalFactory<Promise<T> | T, M> {

  public constructor(
    singletonFunc: (module: M) => Promise<T> | T,
    name?: string,
    description?: string,
  ) {
    super(singletonFunc, name, description)
  }

  public async get(container: M): Promise<T> {
    if (!this.value) {
      this.value = await this.singletonFunc(container)
    }

    return this.value
  }

}
