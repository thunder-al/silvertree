import {TTapMetaFunc} from './index'
import {
  setClassConstructorParameterMetadata,
  setClassMetadata,
  setClassMethodMetadata,
  setClassMethodParameterMetadata,
  setClassPropertyMetadata,
  tapClassConstructorParameterMetadata,
  tapClassMetadata,
  tapClassMethodMetadata,
  tapClassMethodParameterMetadata,
  tapClassPropertyMetadata,
} from './writer'

/**
 * Decorate a class with a key/value pair
 */
export function DecorateClass(key: string, value: any): ClassDecorator {
  return function (target: any) {
    setClassMetadata(target, key, value)
    return target
  }
}

/**
 * Decorate a class with a key/value pair, using a tap function to modify the value
 */
export function TapDecorateClass(key: string, tap: TTapMetaFunc): ClassDecorator {
  return function (target: any) {
    tapClassMetadata(target, key, tap)
    return target
  }
}

/**
 * Decorate a property with a key/value pair
 */
export function DecorateProperty(key: string, value: any): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    setClassPropertyMetadata(target, propertyKey, key, value)
  }
}

/**
 * Decorate a property with a key/value pair, using a tap function to modify the value
 */
export function TapDecorateProperty(key: string, tap: TTapMetaFunc): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    tapClassPropertyMetadata(target, propertyKey, key, tap)
  }
}

/**
 * Decorate a method with a key/value pair
 */
export function DecorateMethod(key: string, value: any): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    setClassMethodMetadata(target, propertyKey, key, value)
    return descriptor
  }
}

/**
 * Decorate a method with a key/value pair, using a tap function to modify the value
 */
export function TapDecorateMethod(key: string, tap: TTapMetaFunc): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    tapClassMethodMetadata(target, propertyKey, key, tap)
    return descriptor
  }
}

/**
 * Decorate a parameter with a key/value pair
 */
export function DecorateParameter(key: string, value: any): ParameterDecorator {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (propertyKey) {
      // method parameter
      setClassMethodParameterMetadata(target, propertyKey, parameterIndex, key, value)
    } else {
      // constructor parameter
      setClassConstructorParameterMetadata(target, parameterIndex, key, value)
    }
  }
}

/**
 * Decorate a parameter with a key/value pair, using a tap function to modify the value
 */
export function TapDecorateParameter(key: string, tap: TTapMetaFunc): ParameterDecorator {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (propertyKey) {
      // method parameter
      tapClassMethodParameterMetadata(target, propertyKey, parameterIndex, key, tap)
    } else {
      // constructor parameter
      tapClassConstructorParameterMetadata(target, parameterIndex, key, tap)
    }
  }
}
