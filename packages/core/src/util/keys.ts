import type {TBindKey, TBindKeyRef, TClassConstructor, TConfiguredModuleTerm, TProvideContext} from '../types'
import {bindingKeyToString, getModuleName, Module} from '../module'
import {Container} from '../container'

/**
 * Checks if an object is an instance of a class
 * @param obj
 */
export function isClassConstructor<T>(obj: TClassConstructor<T> | T): obj is TClassConstructor<T> {
  return obj && typeof obj === 'function' && 'prototype' in obj
}

/**
 * Checks if an object is an instance of a class.
 * @param obj
 */
export function isClassInstance<T>(obj: TClassConstructor<T> | T): obj is (T & Object) {
  return obj && typeof obj === 'object' && 'constructor' in obj
}

/**
 * Creates a reference to a binding key.
 * Used when you need to pass a binding key of not defined class to a decorator.
 * @param key
 * @param options if raw is true, key will not be wrapped in a function
 */
export function bindingRef(key: () => TBindKey, options: { raw: true }): TBindKeyRef
export function bindingRef(key: TBindKey, options?: { raw: false }): TBindKeyRef
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

/**
 * Returns a string representation of a provided chain.
 * @param chain
 * @param options
 */
export function formatProvideChain(
  chain: TProvideContext['chain'],
  options?: {
    multiline?: boolean,
    includeFactories?: boolean
  },
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

/**
 * Create a configured module term.
 * @param module
 * @param configure
 * @param options if `strict` is true (by default), error will be thrown if the module already registered
 */
export function configureModule<
  M extends Module,
  Cfg = M extends Module<infer C> ? C : any,
  C extends Container = Container,
  MP extends Module = Module,
>(
  module: TClassConstructor<M>,
  configure: (container: C, parentMod: MP | null) => Promise<Cfg> | Cfg,
  options?: { strict?: boolean },
): TConfiguredModuleTerm<M, C, MP | null, Cfg> {
  return {
    __isConfModuleTerm: true,
    strict: options?.strict ?? true,
    module,
    config: configure,
  }
}

/**
 * Check if an object is a configured module term.
 * @param obj
 */
export function isConfiguredModuleTerm<M extends Module = any>(obj: any): obj is TConfiguredModuleTerm<M> {
  return obj.__isConfModuleTerm === true
}

/**
 * Extract a configured module term.
 * @param term
 */
export function extractConfiguredModuleTerm<
  M extends Module,
  T extends TConfiguredModuleTerm<M, any, any, any> | TClassConstructor<Module>
>(term: T): [
  TClassConstructor<M>,
  T extends TConfiguredModuleTerm<M, infer C, infer MP, infer Cfg>
    ? (container: C, module: MP | null) => Promise<Cfg> | Cfg
    : null
] {
  if (isConfiguredModuleTerm(term)) {
    return [
      term.module,
      term.config as any,
    ]
  }

  return [
    term as TClassConstructor<M>,
    null as any,
  ]
}

/**
 * Check if an object is an instance of a class.
 * Can check not only class instances, but also class constructor functions.
 */
export function instanceOf<P>(obj: any, parent: TClassConstructor<P>) {
  if (!parent) {
    throw new Error('Parent class is not defined for instanceOf check')
  }

  if (!obj) {
    return false
  }

  if (obj instanceof parent) {
    return true
  }

  const proto = Object.getPrototypeOf(obj)
  if (!proto || proto === Object || proto === Object.getPrototypeOf(Object)) {
    return false
  }

  if (proto === parent) {
    return true
  }

  return instanceOf(proto, parent)
}
