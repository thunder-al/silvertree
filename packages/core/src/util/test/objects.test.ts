import {expect, test} from 'vitest'
import {objectGet, objectOmit, objectPick} from '../objects'

test('object', () => {
  const obj = {
    a: 1,
    b: '2',
    c: {d: [3, 4]},
  }

  expect(objectPick(obj, ['a', 'c'])).toStrictEqual({
    a: 1,
    c: {d: [3, 4]},
  })

  expect(objectOmit(obj, ['a', 'c'])).toStrictEqual({
    b: '2',
  })

  expect(objectGet(obj, 'a')).toBe(1)
  expect(objectGet(obj, 'c.d.0')).toBe(3)
  expect(objectGet(obj, 'c.d.1')).toBe(4)

})
