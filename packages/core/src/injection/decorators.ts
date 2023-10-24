import {
  IInjectOptions,
  TBindKey,
  TBindKeyRef,
  TClassInjectArgumentMetadataItem,
  TClassInjectPropertyMetadataItem,
} from '../types'
import {tapClassMetadata} from '../metadata'
import {INJECT_CLASS_ARGUMENT_METADATA_KEY, INJECT_CLASS_PROPERTY_METADATA_KEY} from './const'
import {bindingRef, isBindingRef, isClassInstance} from '../util'

/**
 * Injects a dependency into a class property, method parameter or constructor parameter.
 * @param key binding key or alias or
 * @param options
 */
export function Inject(
  key: TBindKey | TBindKeyRef,
  options?: Partial<IInjectOptions>,
): PropertyDecorator & ParameterDecorator {

  return function (target: Object, propertyKey?: string | symbol, parameterIndex?: number) {

    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    if (typeof parameterIndex === 'number') {
      decorateInjectArgument(target, propertyKey, parameterIndex, key, options)
    } else if (propertyKey) {
      decorateInjectProperty(target, propertyKey, key, options)
    }
  }
}

/**
 * Inline version of `@Inject(bindingRef(() => SomeKey))`.
 * @param ref
 * @param options
 */
export function InjectFromRef(
  ref: (() => TBindKey) | TBindKeyRef,
  options?: Partial<IInjectOptions>,
) {

  const key = isBindingRef(ref)
    ? ref
    : bindingRef(ref, {raw: true})

  return Inject(key, options)
}

export function decorateInjectProperty(
  target: Object,
  propertyKey: string | symbol,
  key: TBindKey | TBindKeyRef,
  options?: Partial<IInjectOptions>,
) {
  tapClassMetadata(
    target,
    INJECT_CLASS_PROPERTY_METADATA_KEY,
    (metadata: Array<TClassInjectPropertyMetadataItem> = []) => {
      metadata.push({k: key, p: propertyKey, o: options ?? null})
      return metadata
    },
  )
}

/**
 * Decorates a class constructor or method parameter with a dependency injection.
 * @param target
 * @param propertyKey
 * @param parameterIndex
 * @param key
 * @param options
 */
export function decorateInjectArgument(
  target: Object,
  propertyKey: string | symbol | undefined,
  parameterIndex: number,
  key: TBindKey | TBindKeyRef,
  options?: Partial<IInjectOptions>,
) {
  if (!propertyKey) {
    // constructor parameter
    tapClassMetadata(
      target,
      INJECT_CLASS_ARGUMENT_METADATA_KEY,
      (metadata: Array<TClassInjectArgumentMetadataItem> = []) => {
        metadata.push({k: key, p: null, i: parameterIndex, o: options ?? null})
        return metadata
      },
    )
  } else {
    // method parameter
    tapClassMetadata(
      target,
      INJECT_CLASS_ARGUMENT_METADATA_KEY,
      (metadata: Array<TClassInjectArgumentMetadataItem> = []) => {
        metadata.push({k: key, p: propertyKey, i: parameterIndex, o: options ?? null})
        return metadata
      },
    )
  }
}
