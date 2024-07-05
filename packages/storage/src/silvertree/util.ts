export function getStorageServiceInjectKey(scope: string = 'default'): string {
  return `storage:${scope}:service`
}

export function getStorageDiscInjectKey(scope: string = 'default'): string {
  return `storage:${scope}:disc`
}
