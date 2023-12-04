import {expect, test} from 'vitest'
import {camelCase, kebabCase, snakeCase, titleCase} from '../strings'

test('strings', () => {
  const strings = [
    'hello big world',
    'Hello big world',
    'Hello Big World',
    'Hello    Big    World',
    'hello Big World',
    'Hello-Big-World',
    'HelloBigWorld',
    'Hello_Big_World',
  ]

  for (const str of strings) {
    const target = 'helloBigWorld'
    expect(camelCase(str), `camelCase('${str}') !== ${target}`).toBe(target)
  }

  for (const str of strings) {
    const target = 'HelloBigWorld'
    expect(titleCase(str), `titleCase('${str}') !== ${target}`).toBe(target)
  }

  for (const str of strings) {
    const target = 'hello_big_world'
    expect(snakeCase(str), `snakeCase('${str}') !== ${target}`).toBe(target)
  }

  for (const str of strings) {
    const target = 'hello-big-world'
    expect(kebabCase(str), `kebabCase('${str}') !== ${target}`).toBe(target)
  }
})
