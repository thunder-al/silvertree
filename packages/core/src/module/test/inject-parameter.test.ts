import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Inject, InjectFromRef} from '../../injection'
import {Container} from '../../container'
import {Module} from '../Module'

test('inject to parameter', async () => {
  class Class1 {

    @InjectFromRef(() => Class1)
    public readonly class1!: Class1

    @InjectFromRef(() => Class2)
    protected readonly class2!: Class2

    @Inject('string-key')
    public readonly functional!: string

    testMethod() {
      return this.class2.getTest()
    }
  }

  let class2ConstructorTriggerCount = 0

  class Class2 {

    @InjectFromRef(() => Class2)
    public readonly class2!: Class2

    public triggerCount = 0

    constructor() {
      class2ConstructorTriggerCount++
    }

    getTest() {
      this.triggerCount++
      return 'test'
    }
  }

  class TestModule extends Module {

    async setup() {
      this.bind.singletonClass(Class1).alias('class1')
      this.bind.syncSingletonClass(Class2)
      this.bind.syncFunctional('string-key', () => 'test-functional-value')
    }
  }

  const container = new Container()
  await container.register(TestModule)

  const mod = container.getModule(TestModule)
  const instance1 = await mod.provideAsync<Class1>('class1')
  const instance2 = mod.provideSync<Class2>(Class2)

  expect(instance1.class1).toBe(instance1)
  expect(instance2.class2).toBe(instance2)
  expect(instance1.testMethod()).toBe('test')
  expect(instance1.testMethod()).toBe('test')
  expect(instance2.triggerCount).toBe(2)
  expect(class2ConstructorTriggerCount).toBe(1)

})
