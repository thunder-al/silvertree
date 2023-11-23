import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container} from '../../container'
import {Module} from '../index'
import {Inject, InjectFromRef, InjectModule, InjectModuleConfig} from '../../injection'

test('inject to constructor sync', async () => {

  let class1ConstructorTriggerCount = 0

  class Class1 {

    constructor(
      @InjectFromRef(() => Class2)
      protected readonly class2: Class2,
      @Inject('string-key')
      public readonly functional: string,
      @InjectModule()
      public readonly module: TestModule,
      @InjectModuleConfig()
      public readonly config: any,
    ) {
      class1ConstructorTriggerCount++
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

  class TestModule extends Module<{ test: number }> {
    async setup() {
      this.bind.syncSingletonClass(Class1)
      this.bind.syncSingletonClass(Class2)
      this.bind.syncFunctional('string-key', () => 'test-functional-value')
    }
  }

  const container = new Container()
  await container.register(TestModule, () => ({test: 123}))

  const mod1 = container.getModule(TestModule)
  const instance1 = mod1.provideSync(Class1)
  const instance2 = mod1.provideSync(Class1)
  const instance3 = mod1.provideSync(Class2)

  expect(class1ConstructorTriggerCount).toBe(1)
  expect(instance1.testMethod()).toBe('test')
  expect(instance1.functional).toBe('test-functional-value')
  expect(instance2.testMethod()).toBe('test')
  expect(instance3.triggerCount).toBe(2)

  expect(instance1.module).toBe(mod1)
  expect(instance1.config).toStrictEqual({test: 123})
})
