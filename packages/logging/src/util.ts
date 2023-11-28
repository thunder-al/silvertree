export function omit<T extends Record<string | symbol, any>>(obj: T, keys: Array<string | symbol>): T {
  const result = {...obj}
  for (const key of keys) {
    delete result[key]
  }

  return result

}

export function getLoggerFactoryInjectKey(scope?: string): string {
  return `logger:factory:${scope ?? 'default'}`
}

export function getRootLoggerInjectKey(scope?: string): string {
  return `logger:root:${scope ?? 'default'}`
}

export function getLocalLoggerInjectKey(scope?: string): string {
  return `logger:local:${scope ?? 'default'}`
}
