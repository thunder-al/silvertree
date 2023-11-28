import {Inject} from '@silvertree/core'
import {getLocalLoggerInjectKey} from './util'

export function InjectLogger(scope: string = 'default') {
  return Inject(getLocalLoggerInjectKey(scope))
}
