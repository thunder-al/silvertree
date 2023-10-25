import {TBindKey, TBindKeyRef, TClassConstructor} from '../types'
import {isClassInstance, resolveBindingKey} from '../util'
import {Module} from './Module'

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

export function getModuleName(module: Module | TClassConstructor<Module>): string {

  if (isClassInstance(module)) {
    return module.constructor.name
  }

  return module.name
}
