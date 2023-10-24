import {TClassInjectArgumentMetadataItem, TClassInjectPropertyMetadataItem} from '../types'
import {getClassMetadata} from '../metadata'
import {INJECT_CLASS_ARGUMENT_METADATA_KEY, INJECT_CLASS_PROPERTY_METADATA_KEY} from './const'

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
