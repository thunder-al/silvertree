import {METADATA_PREFIX, TTapMetaFunc} from './index'

/**
 * Decorate a class with a key/value pair
 */
export function setClassMetadata(target: any, key: string, value: any) {
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, target)
}

/**
 * Decorate a class with a key/value pair, using a tap function to modify the value
 */
export function tapClassMetadata<I = any, O = any>(target: any, key: string, tap: TTapMetaFunc<I, O>) {
  const current = Reflect.getMetadata(`${METADATA_PREFIX}${key}`, target)
  const value = tap(current)
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, target)
}

/**
 * Decorate a property with a key/value pair
 */
export function setClassPropertyMetadata(target: any, propertyKey: string | symbol, key: string, value: any) {
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, target, propertyKey)
}

/**
 * Decorate a property with a key/value pair, using a tap function to modify the value
 */
export function tapClassPropertyMetadata<I = any, O = any>(target: any, propertyKey: string | symbol, key: string, tap: TTapMetaFunc<I, O>) {
  const current = Reflect.getMetadata(`${METADATA_PREFIX}${key}`, target, propertyKey)
  const value = tap(current)
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, target, propertyKey)
}

/**
 * Decorate a class method with a key/value pair
 */
export function setClassMethodMetadata(target: any, propertyKey: string | symbol, key: string, value: any) {
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, target, propertyKey)
}

/**
 * Decorate a class method with a key/value pair, using a tap function to modify the value
 */
export function tapClassMethodMetadata<I = any, O = any>(target: any, propertyKey: string | symbol, key: string, tap: TTapMetaFunc<I, O>) {
  const current = Reflect.getMetadata(`${METADATA_PREFIX}${key}`, target, propertyKey)
  const value = tap(current)
  Reflect.defineMetadata(`${METADATA_PREFIX}${key}`, value, target, propertyKey)
}

/**
 * Decorate class function's parameter with a key/value pair
 */
export function setClassMethodParameterMetadata(target: any, propertyKey: string | symbol, parameterIndex: number, key: string, value: any) {
  Reflect.defineMetadata(`${METADATA_PREFIX}arg${parameterIndex}:${key}`, value, target, propertyKey)
}

/**
 * Decorate class function's parameter with a key/value pair, using a tap function to modify the value
 */
export function tapClassMethodParameterMetadata<I = any, O = any>(target: any, propertyKey: string | symbol, parameterIndex: number, key: string, tap: TTapMetaFunc<I, O>) {
  const current = Reflect.getMetadata(`${METADATA_PREFIX}arg${parameterIndex}:${key}`, target, propertyKey)
  const value = tap(current)
  Reflect.defineMetadata(`${METADATA_PREFIX}arg${parameterIndex}:${key}`, value, target, propertyKey)
}

/**
 * Decorate class constructor's parameter with a key/value pair
 */
export function setClassConstructorParameterMetadata(target: any, parameterIndex: number, key: string, value: any) {
  Reflect.defineMetadata(`${METADATA_PREFIX}arg${parameterIndex}:${key}`, value, target)
}

/**
 * Decorate class constructor's parameter with a key/value pair, using a tap function to modify the value
 */
export function tapClassConstructorParameterMetadata<I = any, O = any>(target: any, parameterIndex: number, key: string, tap: TTapMetaFunc<I, O>) {
  const current = Reflect.getMetadata(`${METADATA_PREFIX}arg${parameterIndex}:${key}`, target)
  const value = tap(current)
  Reflect.defineMetadata(`${METADATA_PREFIX}arg${parameterIndex}:${key}`, value, target)
}
