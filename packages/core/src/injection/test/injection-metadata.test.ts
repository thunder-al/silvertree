import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Inject, InjectFromRef} from '../decorators'
import {getClassArgumentInjections, getClassPropertyInjections} from '../func'

test('injection-metadata', () => {

  class StubClass1 {
  }

  class Class1 {

    @Inject(StubClass1)
    field1!: StubClass1

    constructor(
      @InjectFromRef(() => StubClass2)
      public constructorParam: any,
    ) {
    }

    method1(
      @Inject('some-key1')
        arg1: any,
      @Inject('some-key2')
        arg2: any,
    ) {
    }

    method2(
      @InjectFromRef(() => StubClass2)
        arg3: any,
      @Inject('some-key4')
        arg4: any,
    ) {
    }
  }

  // define second class to test refs
  class StubClass2 {
  }

  for (const meta of [
    getClassPropertyInjections(Class1),
    getClassPropertyInjections(new Class1(null)),
  ]) {
    expect(meta)
      .toEqual([
        {
          'k': StubClass1,
          'o': undefined,
          'p': 'field1',
        },
      ])
  }


  for (const meta of [
    getClassArgumentInjections(Class1, null),
    getClassArgumentInjections(new Class1(null), null),
  ]) {
    expect(meta)
      .toEqual([
        {
          'i': 0,
          'k': expect.objectContaining({__isBindRef: true}),
          'o': undefined,
          'p': null,
        },
      ])
  }

  for (const meta of [
    getClassArgumentInjections(Class1, 'method1'),
    getClassArgumentInjections(new Class1(null), 'method1'),
  ]) {
    expect(meta)
      .toEqual([
        {
          'i': 1,
          'k': 'some-key2',
          'o': undefined,
          'p': 'method1',
        },
        {
          'i': 0,
          'k': 'some-key1',
          'o': undefined,
          'p': 'method1',
        },
      ])
  }

  for (const meta of [
    getClassArgumentInjections(Class1, 'method2'),
    getClassArgumentInjections(new Class1(null), 'method2'),
  ]) {
    expect(meta)
      .toEqual([
        {
          'i': 1,
          'k': 'some-key4',
          'o': undefined,
          'p': 'method2',
        },
        {
          'i': 0,
          'k': expect.objectContaining({__isBindRef: true}),
          'o': undefined,
          'p': 'method2',
        },
      ])
  }
})
