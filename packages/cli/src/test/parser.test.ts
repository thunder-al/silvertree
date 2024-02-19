import {expect, test} from 'vitest'
import {parseArgv} from '../util'

test('argv parser', () => {

  const argv = [
    'qwe',
    '--name', 'John',
    '-a', '20',
    'hello',
    'world',
  ]

  expect(parseArgv(argv)).toEqual({
    options: {
      name: 'John',
    },
    optionsShort: {
      a: '20',
    },
    args: [
      'qwe',
      'hello',
      'world',
    ],
  })

  expect(parseArgv(argv, 'qwe')).toEqual({
    options: {
      name: 'John',
    },
    optionsShort: {
      a: '20',
    },
    args: [
      'hello',
      'world',
    ],
  })
})
