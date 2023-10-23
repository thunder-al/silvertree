import 'reflect-metadata'
import {expect, test} from 'vitest'
import {getClassMetadata, getPropertyMetadata, getPropertyMetadataKeys} from '..'
import {DecorateMethod, TapDecorateMethod} from '../common-decorator'

test('method decorate functions', () => {

  class Class1 {
    @DecorateMethod('some-key', 'some-value')
    @DecorateMethod('some-key2', 'some-value2')
    method1() {
    }
  }

  expect(getPropertyMetadata(Class1, 'method1', 'some-key')).toBe('some-value')
  expect(getPropertyMetadata(new Class1, 'method1', 'some-key')).toBe('some-value')

  expect(getPropertyMetadata(Class1, 'method1', 'some-key2')).toBe('some-value2')
  expect(getPropertyMetadata(new Class1, 'method1', 'some-key2')).toBe('some-value2')

  expect(getClassMetadata(Class1, 'some-key3')).toBeUndefined()
  expect(getClassMetadata(new Class1, 'some-key3')).toBeUndefined()

  expect(getPropertyMetadataKeys(Class1, 'method1')).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))
  expect(getPropertyMetadataKeys(new Class1, 'method1')).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))

  class Class2 {
    @TapDecorateMethod('some-key', (value: string) => value + '-tap')
    @DecorateMethod('some-key', 'some-value')
    method1() {
    }
  }

  expect(getPropertyMetadata(Class2, 'method1', 'some-key')).toBe('some-value-tap')
  expect(getPropertyMetadata(new Class2, 'method1', 'some-key')).toBe('some-value-tap')

  class Class3 {
    @TapDecorateMethod('some-key', (value: Array<string> = []) => [...value, 'tap2'])
    @TapDecorateMethod('some-key', (value: Array<string> = []) => [...value, 'tap1'])
    method1() {
    }
  }

  expect(getPropertyMetadata(Class3, 'method1', 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))
  expect(getPropertyMetadata(new Class3, 'method1', 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))

})
