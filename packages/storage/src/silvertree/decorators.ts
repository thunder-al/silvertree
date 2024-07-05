import {Inject} from '@silvertree/core'
import {getStorageDiscInjectKey, getStorageServiceInjectKey} from './util'

export function InjectDisc(disc: string = 'default', scope: string = 'default') {
  const key = getStorageDiscInjectKey(scope)
  return Inject(key, {disc, scope})
}

export function InjectStorageMenager(scope: string = 'default') {
  const key = getStorageServiceInjectKey(scope)
  return Inject(key)
}
