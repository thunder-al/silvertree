import {expect, test} from 'vitest'
import {NestedError} from '../errors'

test('errors', async () => {
  const err1 = new Error('err1')

  const err2 = new NestedError('err2', err1)
  const err3 = new NestedError('err3', err1, {nestedStack: false})
  const err4 = new NestedError('err4', err1, {messageCause: false})

  const err5 = new NestedError('err5', err2)

  expect(err2.message).toEqual('err2\nCause: Error: err1')
  expect(err2.stack).toMatch(/^NestedError: err2\nCause: Error: err1(?:\n\s+at.+)+\nCaused By: Error: err1(?:\n\s+at.+)+$/)

  expect(err3.message).toEqual('err3\nCause: Error: err1')
  expect(err3.stack).toMatch(/^NestedError: err3\nCause: Error: err1(?:\n\s+at.+)+$/)

  expect(err4.message).toEqual('err4')
  expect(err4.stack).toMatch(/^NestedError: err4(?:\n\s+at.+)+\nCaused By: Error: err1(?:\n\s+at.+)+$/)

  expect(err5.message).toEqual('err5\nCause: NestedError: err2\nCause: Error: err1')
  expect(err5.stack).toMatch(/^NestedError: err5\nCause: NestedError: err2\nCause: Error: err1(?:\n\s+at.+)+\nCaused By: NestedError: err2\nCause: Error: err1(?:\n\s+at.+)+\nCaused By: Error: err1(?:\n\s+at.+)+$/)
})

/*
Output of `throw err5` will be:

NestedError: err5
Cause: NestedError: err2
Cause: Error: err1
    at .../errors.test.ts:11:16
    at .../index.js:135:14
...
Caused By: NestedError: err2
Cause: Error: err1
    at .../errors.test.ts:7:16
    at .../index.js:135:14
...
Caused By: Error: err1
    at .../errors.test.ts:5:16
    at .../index.js:135:14
...
 */
