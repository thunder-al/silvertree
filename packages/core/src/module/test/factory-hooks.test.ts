import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Module} from '..'
import {Container} from '../../container'

test('async factory hooks', async () => {

  class Svc1 {
    public value = 0

    constructor() {
      expect(this.value).toBe(0)
    }

    increment() {
      this.value++
    }
  }

  class TestModule extends Module {
    async setup() {
      this.bind.singletonClass(Svc1)
        .export({global: true})
        .getFactory()
        .on('constructed', instance => instance.increment())
        .on('done', instance => instance.increment())
    }
  }

  const c = await Container.make().registerBatch([TestModule])

  const svc1 = await c.provideAsync(Svc1)
  expect(svc1.value).toBe(2)

  svc1.increment()
  expect(svc1.value).toBe(3)

  // should not be triggered
  const svc2 = await c.provideAsync(Svc1)
  expect(svc2.value).toBe(3)
  expect(svc1.value).toBe(3)

  svc2.increment()
  expect(svc2.value).toBe(4)
  expect(svc1.value).toBe(4)

})


test('sync factory hooks', async () => {

  class Svc1 {
    public value = 0

    constructor() {
      expect(this.value).toBe(0)
    }

    increment() {
      this.value++
    }
  }

  class TestModule extends Module {
    async setup() {
      this.bind.syncSingletonClass(Svc1)
        .export({global: true})
        .getFactory()
        .on('constructed', instance => instance.increment())
        .on('done', instance => instance.increment())
    }
  }

  const c = await Container.make().registerBatch([TestModule])

  const svc1 = await c.provideAsync(Svc1)
  expect(svc1.value).toBe(2)

  svc1.increment()
  expect(svc1.value).toBe(3)

  // should not be triggered
  const svc2 = await c.provideAsync(Svc1)
  expect(svc2.value).toBe(3)
  expect(svc1.value).toBe(3)

  svc2.increment()
  expect(svc2.value).toBe(4)
  expect(svc1.value).toBe(4)
})
