import {Module} from '../module'
import {TClassConstructor} from '../types'
import {isClassConstructor} from '../util'

/**
 * Container is a root object of the DI system.
 */
export class Container {
  protected readonly modules = new Set<Module>()

  protected initialized = false

  /**
   * Creates a new container.
   */
  public static make(): Container {
    return new Container()
  }

  /**
   * Registers a new module in the container.
   */
  public register(
    module: TClassConstructor<Module>,
    config?: any,
  ): this {
    const instance = new module(this, config)
    this.modules.add(instance)
    return this
  }

  /**
   * Returns all registered modules.
   */
  public getModules(): Set<Module> {
    return this.modules
  }

  /**
   * Returns true if module is registered in the container.
   */
  public hasModule(module: Module | TClassConstructor<Module>): boolean {
    if (isClassConstructor(module)) {
      for (const mod of this.modules) {
        if (mod instanceof module) {
          return true
        }
      }
    }

    return this.modules.has(module as Module)
  }

  /**
   * Initializes all modules in the container.
   */
  public async init() {
    if (this.initialized) {
      throw new Error('Container is already initialized')
    }

    for (const module of this.modules) {
      await this.initModule(module)
    }

    this.initialized = true

    return this
  }

  protected async initModule(module: Module) {
    await module.init()
  }
}


