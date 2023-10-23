import 'reflect-metadata'
import {expect, test} from 'vitest'
import {DecorateClass, TapDecorateClass} from '../common-decorator'
import {getClassMetadata, getClassMetadataKeys} from '../reader'

test('class-decorate', () => {

  @DecorateClass('some-key', 'some-value')
  @DecorateClass('some-key2', 'some-value2')
  class Class1 {
  }

  expect(getClassMetadata(Class1, 'some-key')).toBe('some-value')
  expect(getClassMetadata(new Class1, 'some-key')).toBe('some-value')

  expect(getClassMetadata(Class1, 'some-key2')).toBe('some-value2')
  expect(getClassMetadata(new Class1, 'some-key2')).toBe('some-value2')

  expect(getClassMetadata(Class1, 'some-key3')).toBeUndefined()
  expect(getClassMetadata(new Class1, 'some-key3')).toBeUndefined()

  expect(getClassMetadataKeys(Class1)).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))
  expect(getClassMetadataKeys(new Class1)).toStrictEqual(expect.arrayContaining(['some-key', 'some-key2']))

  @TapDecorateClass('some-key', (value: string) => value + '-tap')
  @DecorateClass('some-key', 'some-value')
  class Class2 {
  }

  expect(getClassMetadata(Class2, 'some-key')).toBe('some-value-tap')
  expect(getClassMetadata(new Class2, 'some-key')).toBe('some-value-tap')

  @TapDecorateClass('some-key', (value: Array<string> = []) => [...value, 'tap2'])
  @TapDecorateClass('some-key', (value: Array<string> = []) => [...value, 'tap1'])
  class Class3 {
  }

  expect(getClassMetadata(Class3, 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))
  expect(getClassMetadata(new Class3, 'some-key')).toStrictEqual(expect.arrayContaining(['tap1', 'tap2']))

})
