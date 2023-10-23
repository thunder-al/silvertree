import {METADATA_PREFIX} from '.'
import {isClassConstructor, isClassInstance} from '../util'

/**
 * Get metadata from a class
 */
export function getClassMetadata<T = any>(target: any, key: string): T {
  if (isClassInstance(target)) {
    target = target.constructor
  }

  return Reflect.getOwnMetadata(METADATA_PREFIX + key, target)
}

/**
 * Get metadata keys from a class
 */
export function getClassMetadataKeys(target: any): Array<string> {
  if (isClassInstance(target)) {
    target = target.constructor
  }

  return extractSilvertreeMetadataKeys(Reflect.getMetadataKeys(target))
}

/**
 * Get metadata from a class method or field
 */
export function getPropertyMetadata<T = any>(target: any, prop: string, key: string): T {
  if (isClassConstructor(target)) {
    target = target.prototype
  }

  return Reflect.getMetadata(METADATA_PREFIX + key, target, prop)
}

/**
 * Get metadata keys from a class method or field
 */
export function getPropertyMetadataKeys(target: any, prop: string): Array<string> {
  if (isClassConstructor(target)) {
    target = target.prototype
  }

  return extractSilvertreeMetadataKeys(Reflect.getMetadataKeys(target, prop))
}

/**
 * Get metadata from a class method's argument
 */
export function getMethodArgumentMetadata<T = any>(target: any, prop: string, argIndex: number, key: string): T {
  return getPropertyMetadata(target, prop, `arg${argIndex}:${key}`)
}

/**
 * Get metadata keys from a class method's argument
 */
export function getMethodArgumentMetadataKeys(target: any, prop: string, argIndex: number): Array<string> {
  const prefix = `arg${argIndex}:`

  return getPropertyMetadataKeys(target, prop)
    .filter(key => key.startsWith(prefix))
    .map(key => key.substring(prefix.length))
}

/**
 * Get metadata from a class constructor's argument
 */
export function getConstructorArgumentMetadata<T = any>(target: any, argIndex: number, key: string): T {
  return getClassMetadata(target, `arg${argIndex}:${key}`)
}

/**
 * Get metadata keys from a class constructor's argument
 */
export function getConsturctorArgumentMetadataKeys(target: any, argIndex: number): Array<string> {
  const prefix = `arg${argIndex}:`

  return getClassMetadataKeys(target)
    .filter(key => key.startsWith(prefix))
    .map(key => key.substring(prefix.length))
}

function extractSilvertreeMetadataKeys(keys: Array<string>): Array<string> {
  return keys
    .filter(key => key.startsWith(METADATA_PREFIX))
    .map(key => key.substring(METADATA_PREFIX.length))
}

/**
 * Get all metadata from all properties of a class. Record<propName, Record<key, value>>.
 * Warning: field metadata appears only for class instances, not for class constructors.
 */
export function getClassPropertyAllMetadata(target: any) {
  const meta: Record<string, Record<string, any>> = {}

  if (isClassConstructor(target)) {
    target = target.prototype
  }

  const props = [
    ...Object.getOwnPropertyNames(target),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(target)),
  ].filter(prop => prop !== 'constructor' && prop !== 'prototype' && !prop.startsWith('_'))

  for (const propName of props) {
    for (const metaKey of getPropertyMetadataKeys(target, propName)) {
      meta[propName] ??= {}
      meta[propName][metaKey] = getPropertyMetadata(target, propName, metaKey)
    }
  }

  return meta
}

/**
 * Get metadata by given key from all properties of a class. Record<propName, value>
 * Warning: field metadata appears only for class instances, not for class constructors.
 */
export function getClassPropertyMetadata(target: any, key: string) {
  const meta: Record<string, any> = {}

  if (isClassConstructor(target)) {
    target = target.prototype
  }

  const props = [
    ...Object.getOwnPropertyNames(target),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(target)),
  ].filter(prop => prop !== 'constructor' && prop !== 'prototype' && !prop.startsWith('_'))

  for (const propName of props) {
    for (const metaKey of getPropertyMetadataKeys(target, propName)) {
      if (metaKey !== key) {
        continue
      }
      meta[propName] = getPropertyMetadata(target, propName, metaKey)
    }
  }

  return meta
}
