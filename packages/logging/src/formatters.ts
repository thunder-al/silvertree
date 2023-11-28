import * as winston from 'winston'
import {inspect} from 'node:util'
import {omit} from './util'
import {LoggerRootModuleConfig} from './types'

const defaultSystemLabels = [
  Symbol.for('level'), Symbol.for('splat'),
  'timestamp', 'module', 'message', 'level', 'hostname',
]

export function makeSimpleFormatter(config: LoggerRootModuleConfig) {
  const hideLabels = [
    ...config?.hideSystemLabels ?? true ? defaultSystemLabels : [],
    ...config?.hideLabels ?? [],
  ]

  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => {
        const data = omit(info, hideLabels)

        const stringifyRest = Object.keys(data).length > 0
          ? inspect(data, {colors: false, breakLength: Infinity, compact: true, depth: 5})
          : ''

        return `${info.timestamp}${info.module ? ` (${info.module})` : ''} ${info.level}: ${info.message} ${stringifyRest}`
      }),
    ),
  })
}

export function makePrettyFormatter(config: LoggerRootModuleConfig) {
  const hideLabels = [
    ...config.hideSystemLabels ? defaultSystemLabels : [],
    ...config.hideLabels ?? [],
  ]

  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => {
        const data = omit(info, hideLabels)

        const stringifyRest = Object.keys(data).length > 0
          ? inspect(data, {colors: true, compact: true, showHidden: false})
          : ''

        return (
          `\x1b[90m${info.timestamp}\x1b[0m ` +
          `\x1b[35m[${info.hostname}]\x1b[0m` +
          `${info.module ? ` ${info.module}` : ''} ${info.level}: ` +
          `${info.message} ` +
          `${stringifyRest}`
        ).trim()
      }),
    ),
  })
}

export function makeJsonFormatter(_: LoggerRootModuleConfig) {
  return new winston.transports.Console({
    format: winston.format.json(),
  })
}
