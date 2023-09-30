import {expect, test} from 'vitest'
import {Container} from '../Container'
import {SingletonFactory} from '../../factory/SingletonFactory'

test('simple singleton sync provide', () => {
  class MyContainer extends Container {

    triggers = 0

    setup() {
      this.bind('val', new SingletonFactory(() => {
        this.triggers++
        return ['some', 'string'].join(' ')
      }))
    }
  }

  const c = new MyContainer()
  c.setup()

  expect(c.triggers, 'singleton is not triggered').toBe(0)

  expect(c.provide('val'), 'singleton provide value').toBe('some string')
  expect(c.triggers, 'singleton provide').toBe(1)

  expect(c.provide('val'), 'singleton provide same value').toBe('some string')
  expect(c.provide('val'), 'singleton provide same value').toBe('some string')
  expect(c.triggers, 'check singleton to triggers second time').toBe(1)
})

test('simple singleton sync alias', () => {

  const c = new Container()
  c.bind('val', new SingletonFactory(() => 'some string')).alias('value')


  expect(c.provide('val'), 'singleton provide value').toBe('some string')
  expect(c.provide('value'), 'singleton alias provide value').toBe('some string')
})
