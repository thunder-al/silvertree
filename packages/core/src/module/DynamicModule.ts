import {Container} from '../container'
import {Module} from './Module'

/**
 * This is a special module type designed specially for
 * providing bindings and logic to other modules by its input config.
 *
 * Unlike other modules, this module type is not registered
 * in the container and only be imported only from other modules.
 *
 * Every module import will create a new instance of
 * this module which will be able to process all logic separately.
 *
 * For example, you can register http
 * controllers or database orm models in any module.
 */
export class DynamicModule<Cfg = any> extends Module<Cfg> {
  public static readonly __svt_module_traits: Array<string> = ['dynamic']

  protected importer!: Module | Container

  /**
   * Returns module which imports this dynamic module
   */
  public getImporter() {
    return this.importer
  }

  /**
   * Internal method which is called by container or module which imports this dynamic module.
   * Sets module which imports this dynamic module.
   * @param importer
   */
  public setImporter(importer: Module | Container) {
    this.importer = importer
  }
}
