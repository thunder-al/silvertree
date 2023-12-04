import {TBindKey, TBindKeyRef, TClassConstructor} from '../types'
import {isClassInstance, resolveBindingKey} from '../util/keys'
import {Module} from './Module'

/**
 * Returns human-readable binding key, also resolves binding key reference to the actual binding key.
 * @param key
 */
export function bindingKeyToString(key: TBindKey | TBindKeyRef): string {

  key = resolveBindingKey(key)

  // string
  if (typeof key === 'string') {
    return `String(${key})`
  }

  // symbol
  if (typeof key === 'symbol') {
    return key.toString()
  }

  if (typeof key === 'function') {
    if ('constructor' in key) {

      // class
      const name: string = (<any>key).name || (<any>key).constructor?.name
      return `Class(${name})`

    } else {

      // function
      const name: string = (<Function>key).name
      return `Function(${name})`

    }
  }

  return `Unknown(${(<any>key).toString()})`
}

/**
 * Returns human-readable module name.
 * @param module
 */
export function getModuleName(module: Module | TClassConstructor<Module>): string {

  if (!module) {
    return 'ModuleIsUndefined'
  }

  if (isClassInstance(module)) {
    return module.constructor.name
  }

  return module.name
}
