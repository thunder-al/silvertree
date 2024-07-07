/**
 * Returns a new object with the given keys omitted.
 * Same as `lodash.omit`.
 * @param obj
 * @param keys
 */
export function objectOmit<
  T extends object | Array<any>,
  K extends string | number
>(
  obj: T,
  keys: Array<K> | Set<K> | Iterable<K>,
): T {

  if (Array.isArray(obj)) {
    const result: Array<any> = [...obj]
    const removeIndexes = new Set<any>()

    for (const key of keys) {
      removeIndexes.add(`${key}`)
    }

    return (<Array<any>>result).filter((_, i) => !removeIndexes.has(i)) as T
  }

  const result: any = {...obj}

  for (const key of keys) {
    delete result[`${key}`]
  }

  return result
}

/**
 * Returns a new object with the given keys picked.
 * Same as `lodash.pick`.
 * @param obj
 * @param keys
 */
export function objectPick<
  T extends object,
  K extends string | number
>(
  obj: T,
  keys: Array<K> | Set<K> | Iterable<K>,
): Partial<T> {
  const allowedKeys = new Set<K>()

  for (const key of keys) {
    allowedKeys.add(key)
  }

  if (Array.isArray(obj)) {
    return (<Array<any>>obj).filter((_, i) => allowedKeys.has(i as any)) as T
  }

  const result: any = {}

  for (const key of allowedKeys) {
    if (key in obj) {
      result[key] = (<any>obj)[key]
    }
  }

  return result
}


/**
 * Returns a new object with the given key picked.
 * Same as `lodash.get`.
 * @param obj
 * @param path
 */
export function objectGet<V>(obj: any, path: string | number | symbol): V {
  if (typeof path === 'string' && path.includes('.')) {
    let localKey = path.slice(0, path.indexOf('.'))

    while (localKey) {
      obj = obj[localKey]
      path = path.slice(localKey.length + 1)
      const dotIndex = path.indexOf('.')
      localKey = path.slice(0, dotIndex !== -1 ? dotIndex : path.length)
    }

    return obj as any
  }

  return (<any>obj)[path]
}
