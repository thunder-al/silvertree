import {TClassConstructor} from './types'


export function isClassConstructor<T>(obj: TClassConstructor<T> | T): obj is TClassConstructor<T> {
  return typeof obj === 'function'
}

export function isClassInstance<T>(obj: TClassConstructor<T> | T): obj is (T & Object) {
  return typeof obj === 'object'
}

