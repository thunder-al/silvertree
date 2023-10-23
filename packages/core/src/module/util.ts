import {TClassConstructor} from '../types'
import {isClassInstance} from '../util'
import {TBindKey} from './types'
import {ModuleImportError, makeNoOwnBindingError} from './exceptions'
import {Module} from './Module'

export function bindingKeyToString(key: TBindKey): string {

  // string
  if (typeof key === 'string') {
    return key
  }

  // symbol
  if (typeof key === 'symbol') {
    return key.toString()
  }

  if (typeof key === 'function') {
    if ('constructor' in key) {

      // class
      const name: string = (<any>key).name
      return `Class(${name})`

    } else {

      // function
      const name: string = (<Function>key).name
      return `Function(${name})`

    }
  }

  return `Unknown(${(<any>key).toString()})`
}

export function getModuleName(module: Module | TClassConstructor<Module>): string {

  if (isClassInstance(module)) {
    return module.constructor.name
  }

  return module.name
}

export function assertOwnBinding(m: Module, key: TBindKey) {
  if (!m.hasOwnBind(key)) {
    throw makeNoOwnBindingError(m, key)
  }
}

export function assertOwnBindingOrAlias(m: Module, key: TBindKey) {
  if (!m.hasOwnBindOrAlias(key)) {
    throw makeNoOwnBindingError(m, key)
  }
}

