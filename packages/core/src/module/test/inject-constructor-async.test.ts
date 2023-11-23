import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container} from '../../container'
import {Module} from '../../module/Module'
import {Inject} from '../../injection'

test('inject to constructor async', async () => {

  class Class1 {

    constructor(
      @Inject('class2')
      protected readonly class2: Class2,
      @Inject('string-key')
      public readonly functional: string,
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
      this.bind.singletonClass(Class1)
      this.bind.singletonClass(Class2).alias('class2')
      this.bind.functional('string-key', async () => {
        // tiny delay to test async
        await new Promise(resolve => setTimeout(resolve, 1))
        return 'test-functional-value'
      })
    }
  }

  const container = new Container()
  await container.register(TestModule)

  const mod1 = container.getModule(TestModule)
  const instance1 = await mod1.provideAsync(Class1)
  const instance2 = await mod1.provideAsync(Class1)
  const instance3 = await mod1.provideAsync(Class2)

  expect(instance1.testMethod()).toBe('test')
  expect(instance1.functional).toBe('test-functional-value')
  expect(instance2.testMethod()).toBe('test')
  expect(instance3.triggerCount).toBe(2)
})
