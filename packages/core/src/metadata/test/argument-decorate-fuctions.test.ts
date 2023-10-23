import 'reflect-metadata'
import {expect, test} from 'vitest'
import {DecorateParameter, TapDecorateParameter} from '../common-decorator'
import {getMethodArgumentMetadata, getMethodArgumentMetadataKeys} from '..'

test('argument decorate functions', () => {

  class Class1 {
    method1(
      @DecorateParameter('some-key', 'some-value')
      @DecorateParameter('some-key2', 'some-value2')
        arg1: unknown,
      @DecorateParameter('some-key3', 'some-value3')
        arg2: unknown,
    ) {
    }
  }

  expect(getMethodArgumentMetadata(Class1, 'method1', 0, 'some-key')).toBe('some-value')
  expect(getMethodArgumentMetadata(new Class1, 'method1', 0, 'some-key')).toBe('some-value')

  expect(getMethodArgumentMetadata(Class1, 'method1', 0, 'some-key2')).toBe('some-value2')
  expect(getMethodArgumentMetadata(new Class1, 'method1', 0, 'some-key2')).toBe('some-value2')

  expect(getMethodArgumentMetadata(Class1, 'method1', 1, 'some-key3')).toBe('some-value3')
  expect(getMethodArgumentMetadata(new Class1, 'method1', 1, 'some-key3')).toBe('some-value3')

  expect(getMethodArgumentMetadataKeys(Class1, 'method1', 0)).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))
  expect(getMethodArgumentMetadataKeys(new Class1, 'method1', 0)).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))

  expect(getMethodArgumentMetadataKeys(Class1, 'method1', 1)).toStrictEqual(expect.arrayContaining(['some-key3']))
  expect(getMethodArgumentMetadataKeys(new Class1, 'method1', 1)).toStrictEqual(expect.arrayContaining(['some-key3']))

  class Class2 {
    method1(
      @TapDecorateParameter('some-key', (value: string) => value + '-tap')
      @DecorateParameter('some-key', 'some-value')
        arg1: unknown,
    ) {
    }
  }

  expect(getMethodArgumentMetadata(Class2, 'method1', 0, 'some-key')).toBe('some-value-tap')
  expect(getMethodArgumentMetadata(new Class2, 'method1', 0, 'some-key')).toBe('some-value-tap')

  class Class3 {
    method1(
      @TapDecorateParameter('some-key', (value: Array<string> = []) => [...value, 'tap2'])
      @TapDecorateParameter('some-key', (value: Array<string> = []) => [...value, 'tap1'])
        arg1: unknown,
    ) {
    }
  }

  expect(getMethodArgumentMetadata(Class3, 'method1', 0, 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))
  expect(getMethodArgumentMetadata(new Class3, 'method1', 0, 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))

})
