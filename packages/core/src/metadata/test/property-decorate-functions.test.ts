import 'reflect-metadata'
import {expect, test} from 'vitest'
import {DecorateProperty, TapDecorateProperty} from '../common-decorator'
import {getPropertyMetadata, getPropertyMetadataKeys} from '../reader'

test('property-decorate', () => {

  class Class1 {
    @DecorateProperty('some-key', 'some-value')
    @DecorateProperty('some-key2', 'some-value2')
    prop1!: unknown
  }

  expect(getPropertyMetadata(Class1, 'prop1', 'some-key')).toBe('some-value')
  expect(getPropertyMetadata(new Class1, 'prop1', 'some-key')).toBe('some-value')

  expect(getPropertyMetadata(Class1, 'prop1', 'some-key2')).toBe('some-value2')
  expect(getPropertyMetadata(new Class1, 'prop1', 'some-key2')).toBe('some-value2')

  expect(getPropertyMetadataKeys(Class1, 'prop1')).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))
  expect(getPropertyMetadataKeys(new Class1, 'prop1')).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))

  class Class2 {
    @TapDecorateProperty('some-key', (value: string) => value + '-tap')
    @DecorateProperty('some-key', 'some-value')
    prop1!: unknown
  }

  expect(getPropertyMetadata(Class2, 'prop1', 'some-key')).toBe('some-value-tap')
  expect(getPropertyMetadata(new Class2, 'prop1', 'some-key')).toBe('some-value-tap')

  class Class3 {
    @TapDecorateProperty('some-key', (value: Array<string> = []) => [...value, 'tap2'])
    @TapDecorateProperty('some-key', (value: Array<string> = []) => [...value, 'tap1'])
    prop1!: unknown
  }

  expect(getPropertyMetadata(Class3, 'prop1', 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))
  expect(getPropertyMetadata(new Class3, 'prop1', 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))
})
