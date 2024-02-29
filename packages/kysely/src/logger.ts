import * as kysely from 'kysely'
import {KyselyRootModule} from './KyselyRootModule'
import type {LoggerFactory} from '@silvertree/logging'
import {getModuleName} from '@silvertree/core'

export async function makeKyselyLogger(module: KyselyRootModule): Promise<kysely.LogConfig> {
  try {
    const loggerModule = await import('@silvertree/logging')
    const factory: LoggerFactory = module.provideSync(loggerModule.getLoggerFactoryInjectKey())
    const logger = factory.getChildLogger(getModuleName(module))

    return function (event: kysely.LogEvent) {
      switch (event.level) {
        case 'query':
          logger.debug(`${event.query.sql}`, {
            params: event.query.parameters,
            duration: event.queryDurationMillis,
          })
          break
        case 'error':
          logger.error(`Query error: ${event?.query?.sql}`, {
            params: event?.query?.parameters,
            duration: event?.queryDurationMillis,
            error: (<Error>event.error)?.message ?? event.error,
          })
          break
      }
    }

  } catch (e: any) {
    console.warn('Failed to import or provide @silvertree/logging module. Using regular console instead')
    return ['error']
  }
}
