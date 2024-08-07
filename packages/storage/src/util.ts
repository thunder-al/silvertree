import {IllegalRelativePath} from './exceptions'

export function normalizePath(path: string, silent: boolean = false): string {
  path = path
    .replace(/[\/\\]+/g, '/') // replace backslashes or duplicated slashes with single slash
    .replace(/^\/*/, '') // remove leading slashes

  // resolve relative paths
  const result = []
  for (const part of path.split('/')) {
    if (part === '..') {
      // prevent going above root
      if (typeof result.pop() === 'undefined' && !silent) {
        throw new IllegalRelativePath(path)
      }
    } else if (part !== '.') {
      result.push(part)
    }
  }

  return result.join('/')
}
