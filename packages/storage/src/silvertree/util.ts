export function getStorageServiceInjectKey(scope: string = 'default'): string {
  return `storage:${scope}:service`
}

export function getStorageDiscInjectKey(scope: string = 'default'): string {
  return `storage:${scope}:disc`
}

export function resolvePackageNameFromErrorMessage(msg: string) {
  const matchImport = msg.match(/\(resolved id:\s*([^\]]*)\s*\)/i)
  if (matchImport) {
    return matchImport[1]
  }

  const matchRequire = msg.match(/Cannot find module ["']([^"']*)["']/i)
  if (matchRequire) {
    return matchRequire[1]
  }

  return null
}
