import {NestedError} from './errors'

/**
 * Wait for a number of milliseconds.
 * @param ms
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)))
}

/**
 * Retry a function until it succeeds or times out.
 * Passed function should throw an error if it fails or return a value on success.
 * @param name
 * @param fn
 * @param interval
 * @param timeout
 */
export async function retry<T>(
  name: string,
  fn: () => T | Promise<T>,
  interval = 300,
  timeout = 15_000,
): Promise<T> {
  const start = Date.now()
  let lastError: Error | null = null

  while (Date.now() - start < timeout) {
    try {
      return await fn()
    } catch (e: any) {
      lastError = e
    }

    await wait(interval)
  }

  throw new NestedError(`Function ${name} timed out after ${timeout}ms`, lastError)
}

export function promisePool<T>(
  options: {
    /**
     * Maximum amount of promises running at the same time.
     * @default 10
     */
    concurrency?: number,
    /**
     * Handler function for each item.
     * @param item
     */
    handler: (item: T) => Promise<void> | void,
    /**
     * Will trigger each time an error occurs.
     */
    errorHandler?: (error: Error, item: T) => Promise<void> | void,
    /**
     * Iterable of items.
     */
    items: Iterable<T> | AsyncIterable<T>,
  },
) {

  let current = 0
  let success = 0
  let failed = 0
  const concurrency = options.concurrency ?? 10

  async function* makeIterator(): AsyncGenerator<T> {
    for await (const item of options.items) {
      yield item
    }
  }

  const iterator = makeIterator()

  async function runHandler(item: T) {
    try {
      current++
      await options.handler(item)
      current--
      success++
    } catch (e: any) {
      current--
      failed++
      if (options.errorHandler) {
        await options.errorHandler(e, item)
      }
    }

    await runNextBatch()
  }

  async function runNextBatch() {
    const jobs: Array<Promise<void>> = []

    while (current < concurrency) {
      const {value, done} = await iterator.next()

      if (done) {
        break
      }

      jobs.push(runHandler(value))
    }

    await Promise.all(jobs)

  }

  return {
    /**
     * Current amount of running promises.
     */
    getCurrent: () => current,
    getCuncurrency: () => concurrency,
    run: runNextBatch,
  }

}

/**
 * WIP
 */
function makeControlledIterator<T>() {

  let items: Array<T> = []
  let unlock: (() => void) | null = null
  let isDone = false

  async function* iterator() {
    while (isDone) {

      while (true) {
        let next = items.shift()

        if (next === undefined) {
          break
        }

        yield next
      }

      await new Promise<void>(resolve => unlock = resolve)
    }
  }

  function push(item: T) {
    items.push(item)
    if (unlock) {
      unlock()
    }
  }

  function done() {
    isDone = true
    if (unlock) {
      unlock()
    }
  }

  return {
    iterator: iterator(),
    done,
    push,
  }
}
