import {Module} from '../module'
import {TClassConstructor} from '../types'
import {isClassConstructor} from '../util'
import {getModuleName} from '../module/util'

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
  public async register<
    M extends Module,
    Cfg = M extends Module<infer C> ? C : any,
  >(
    module: TClassConstructor<M>,
    config?: Cfg,
  ): Promise<void> {
    const instance = new module(this, config)
    this.modules.add(instance)

    if (this.initialized) {
      await this.initModule(instance)
    }
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
   * Returns a module by its class.
   * @param module
   */
  public getModule<M extends Module>(module: TClassConstructor<M>): M {
    for (const mod of this.modules) {
      if (mod instanceof module) {
        return mod
      }
    }

    throw new Error(`Module ${getModuleName(module)} is not registered`)
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


