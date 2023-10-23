import 'reflect-metadata'
import {expect, test} from 'vitest'
import {DecorateClass, DecorateMethod, DecorateParameter, DecorateProperty} from '../common-decorator'
import {getClassPropertyAllMetadata, getClassPropertyMetadata} from '../reader'

test('getClassMetadata', () => {

  @DecorateClass('class-key1', 'class-value1')
  @DecorateClass('class-key2', 'class-value2')
  class Class {

    constructor(
      @DecorateParameter('constructor-arg1-key1', 'constructor-arg1-value1')
      @DecorateParameter('constructor-arg1-key2', 'constructor-arg1-value2')
        arg1: unknown = null,
      @DecorateParameter('constructor-arg2-key1', 'constructor-arg2-value1')
      @DecorateParameter('constructor-arg2-key2', 'constructor-arg2-value2')
        arg2: unknown = null,
    ) {
    }

    @DecorateProperty('field-key1', 'field-value1')
    @DecorateProperty('field-key2', 'field-value2')
    field1: unknown = null

    @DecorateMethod('method-key1', 'method-value1')
    @DecorateMethod('method-key2', 'method-value2')
    method1() {
    }
  }

  expect(getClassPropertyAllMetadata(Class)).toEqual({
    'method1': {
      'method-key1': 'method-value1',
      'method-key2': 'method-value2',
    },
  })


  expect(getClassPropertyAllMetadata(new Class)).toEqual({
    'method1': {
      'method-key1': 'method-value1',
      'method-key2': 'method-value2',
    },
    'field1': {
      'field-key1': 'field-value1',
      'field-key2': 'field-value2',
    },
  })

  expect(getClassPropertyMetadata(Class, 'method-key1')).toEqual({'method1': 'method-value1'})
  expect(getClassPropertyMetadata(new Class, 'method-key2')).toEqual({'method1': 'method-value2'})

  expect(getClassPropertyMetadata(new Class, 'field-key1')).toEqual({'field1': 'field-value1'})
  expect(getClassPropertyMetadata(new Class, 'field-key2')).toEqual({'field1': 'field-value2'})

})
