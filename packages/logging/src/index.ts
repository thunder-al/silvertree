export * from './decorators'
export * from './logger-factory'
export * from './logger-module'
export * from './logger-root-module'
export type * from './types'
export * from './util'

export type {LoggerOptions} from 'winston'
import * as winston from 'winston'

export {winston}

export const Logger = winston.Logger
