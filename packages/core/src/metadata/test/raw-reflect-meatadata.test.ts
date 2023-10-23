import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Module} from '../../module'
import {Container} from '../../container'


@Reflect.metadata('class-key', 'class-val')
class Class1 {
  @Reflect.metadata('method-key', 'method-val')
  method() {
  }
}

class Class2 extends Class1 {
  method() {
  }
}

test('basic reflect metadata', () => {

  const instance1 = new Class1

  // constructor
  expect(Reflect.getMetadata('method-key', instance1, 'method')).toBe('method-val')
  expect(Reflect.getMetadata('method-key', Class1.prototype, 'method')).toBe('method-val')
  expect(Reflect.getMetadataKeys(Class1.prototype, 'method')).toStrictEqual(['method-key'])
  expect(Reflect.getMetadataKeys(instance1, 'method')).toStrictEqual(['method-key'])

  // method
  expect(Reflect.getMetadata('class-key', instance1.constructor)).toBe('class-val')
  expect(Reflect.getMetadata('class-key', Class1)).toBe('class-val')
  expect(Reflect.getMetadataKeys(Class1)).toStrictEqual(['class-key'])
})

test('basic reflect metadata extends', () => {

  const instance2 = new Class2

  // constructor
  expect(Reflect.getMetadata('method-key', instance2, 'method')).toBe('method-val')
  expect(Reflect.getMetadata('method-key', Class2.prototype, 'method')).toBe('method-val')
  expect(Reflect.getMetadataKeys(Class2.prototype, 'method')).toStrictEqual(['method-key'])
  expect(Reflect.getMetadataKeys(instance2, 'method')).toStrictEqual(['method-key'])

  // method
  expect(Reflect.getMetadata('class-key', instance2.constructor)).toBe('class-val')
  expect(Reflect.getMetadata('class-key', Class2)).toBe('class-val')
  expect(Reflect.getMetadataKeys(Class2)).toStrictEqual(['class-key'])
})
