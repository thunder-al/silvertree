import {expect, test} from 'vitest'
import {promisePool, wait} from '../functional'

test('functional', async () => {

  const data: Array<number> = []

  const {run} = promisePool({
    concurrency: 10,
    async handler(item) {
      await wait(item * 10)
      data.push(item)
    },
    items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  })

  await run()

  expect(data).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])

})
