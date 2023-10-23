import 'reflect-metadata'
import {expect, test} from 'vitest'
import {getConstructorArgumentMetadata, getConsturctorArgumentMetadataKeys} from '..'
import {DecorateParameter, TapDecorateParameter} from '../common-decorator'

test('argument decorate functions', () => {

  class Class1 {
    constructor(
      @DecorateParameter('some-key', 'some-value')
      @DecorateParameter('some-key2', 'some-value2')
        arg1: unknown = null,
      @DecorateParameter('some-key3', 'some-value3')
        arg2: unknown = null,
    ) {
    }
  }

  expect(getConstructorArgumentMetadata(Class1, 0, 'some-key')).toBe('some-value')
  expect(getConstructorArgumentMetadata(new Class1, 0, 'some-key')).toBe('some-value')

  expect(getConstructorArgumentMetadata(Class1, 0, 'some-key2')).toBe('some-value2')
  expect(getConstructorArgumentMetadata(new Class1, 0, 'some-key2')).toBe('some-value2')

  expect(getConstructorArgumentMetadata(Class1, 1, 'some-key3')).toBe('some-value3')
  expect(getConstructorArgumentMetadata(new Class1, 1, 'some-key3')).toBe('some-value3')

  expect(getConsturctorArgumentMetadataKeys(Class1, 0)).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))
  expect(getConsturctorArgumentMetadataKeys(new Class1, 0)).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))

  expect(getConsturctorArgumentMetadataKeys(Class1, 1)).toStrictEqual(expect.arrayContaining(['some-key3']))
  expect(getConsturctorArgumentMetadataKeys(new Class1, 1)).toStrictEqual(expect.arrayContaining(['some-key3']))

  class Class2 {
    constructor(
      @TapDecorateParameter('some-key', (value: string) => value + '-tap')
      @DecorateParameter('some-key', 'some-value')
        arg1: unknown = null,
    ) {
    }
  }

  expect(getConstructorArgumentMetadata(Class2, 0, 'some-key')).toBe('some-value-tap')
  expect(getConstructorArgumentMetadata(new Class2, 0, 'some-key')).toBe('some-value-tap')

  class Class3 {
    constructor(
      @TapDecorateParameter('some-key', (value: Array<string> = []) => [...value, 'tap2'])
      @TapDecorateParameter('some-key', (value: Array<string> = []) => [...value, 'tap1'])
        arg1: unknown = null,
    ) {
    }
  }

  expect(getConstructorArgumentMetadata(Class3, 0, 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))
  expect(getConstructorArgumentMetadata(new Class3, 0, 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))

})
