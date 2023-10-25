import {TBindKey, TBindKeyRef, TClassConstructor, TProvideContext} from './types'
import {bindingKeyToString, getModuleName} from './module/util'


export function isClassConstructor<T>(obj: TClassConstructor<T> | T): obj is TClassConstructor<T> {
  return typeof obj === 'function'
}

export function isClassInstance<T>(obj: TClassConstructor<T> | T): obj is (T & Object) {
  return typeof obj === 'object'
}

export function bindingRef(key: () => TBindKey, options: { raw: true }): TBindKeyRef
export function bindingRef(key: TBindKey, options?: { raw: false }): TBindKeyRef

/**
 * Creates a reference to a binding key.
 * Used when you need to pass a binding key of not defined class to a decorator.
 * @param key
 * @param options if raw is true, key will not be wrapped in a function
 */
export function bindingRef(key: TBindKey | (() => TBindKey), options?: { raw?: boolean }): TBindKeyRef {
  const storedInjectionKey = options?.raw
    ? key as TBindKeyRef
    : (() => key) as TBindKeyRef

  storedInjectionKey.__isBindRef = true

  return storedInjectionKey
}

/**
 * Check if a key is a reference to a binding key.
 * @param key
 */
export function isBindingRef(key: any): key is TBindKeyRef {
  return typeof key === 'function' && key.__isBindRef === true
}

/**
 * Resolve a binding key from a reference.
 * @param key
 */
export function resolveBindingKey(key: TBindKey | TBindKeyRef): TBindKey {
  return isBindingRef(key) ? key() : key
}

export function formatProvideChain(
  chain: TProvideContext['chain'],
  options?: { multiline?: boolean, includeFactories?: boolean },
) {
  const elements: Array<string> = []
  const separator = options?.multiline ? '\n' : ' <- '

  for (const el of chain) {
    if (options?.includeFactories) {
      elements.push(`${getModuleName(el.module)}(${bindingKeyToString(el.key)})${el.factory.constructor.name}`)
    } else {
      elements.push(`${getModuleName(el.module)}(${bindingKeyToString(el.key)})`)
    }
  }

  return elements.join(separator)
}
