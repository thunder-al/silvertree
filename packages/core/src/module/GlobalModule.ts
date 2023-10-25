import {Module} from './Module'

/**
 * All exported bindings from global module will be available in all modules
 */
export class GlobalModule extends Module {

  isGlobal() {
    return true
  }
}
