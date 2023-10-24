import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container} from '../../container'
import {Module} from '../../module'
import {InjectFromRef} from '../../injection'

test('singleton sync', async () => {

  class Class1 {

    constructor(
      @InjectFromRef(() => Class2)
      protected readonly class2: Class2,
    ) {
    }

    testMethod() {
      return this.class2.getTest()
    }
  }

  class Class2 {
    public triggerCount = 0

    getTest() {
      this.triggerCount++
      return 'test'
    }
  }

  class TestModule extends Module {
    async setup() {
      this.bind.syncSingletonClass(Class1)
      this.bind.syncSingletonClass(Class2)
    }
  }

  const container = new Container()
  await container.register(TestModule)
  await container.init()

  const mod1 = container.getModule(TestModule)
  const instance1 = mod1.provideSync<Class1>(Class1)
  const instance2 = mod1.provideSync<Class1>(Class1)
  const instance3 = mod1.provideSync<Class2>(Class2)

  expect(instance1.testMethod()).toBe('test')
  expect(instance2.testMethod()).toBe('test')
  expect(instance3.triggerCount).toBe(2)
})
