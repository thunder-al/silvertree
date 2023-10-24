import {TBindKey, TBindKeyRef, TClassInjectArgumentMetadataItem, TClassInjectPropertyMetadataItem} from '../types'
import {getClassMetadata} from '../metadata'
import {INJECT_CLASS_ARGUMENT_METADATA_KEY, INJECT_CLASS_PROPERTY_METADATA_KEY} from './const'

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
    ? (() => key) as TBindKeyRef
    : key as TBindKeyRef

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
 * Get class property injections.
 * Will respect parent injections.
 * @param target
 */
export function getClassPropertyInjections(target: Object): Array<TClassInjectPropertyMetadataItem> {
  return getClassMetadata(target, INJECT_CLASS_PROPERTY_METADATA_KEY, false) ?? []
}

/**
 * Get class constructor/method argument injections.
 * @param target target class or its instance
 * @param methodName method name or null for constructor
 */
export function getClassArgumentInjections(target: Object, methodName: string | null): Array<TClassInjectArgumentMetadataItem> {
  const meta: Array<TClassInjectArgumentMetadataItem> = getClassMetadata(target, INJECT_CLASS_ARGUMENT_METADATA_KEY, true) ?? []
  return meta.filter(item => item.p === methodName)
}
