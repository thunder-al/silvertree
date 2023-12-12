import type {Bindings, FastifyBaseLogger} from 'fastify/types/logger'
import {InjectLogger, Logger} from '@silvertree/logging'

export class FastifyLoggerAdapter implements FastifyBaseLogger {
  @InjectLogger()
  protected readonly log!: Logger

  public debug(arg1: unknown, arg2?: unknown, ...other: unknown[]) {
    const hasObj = typeof arg1 === 'object'
    const obj = hasObj ? arg1 : {}
    const message: any = hasObj ? arg2 : arg1
    this.log.debug(message, obj)
  }

  public error(arg1: unknown, arg2?: unknown, ...other: unknown[]) {
    const hasObj = typeof arg1 === 'object'
    const obj = hasObj ? arg1 : {}
    const message: any = hasObj ? arg2 : arg1
    this.log.error(message, obj)
  }

  public fatal(arg1: unknown, arg2?: unknown, ...other: unknown[]) {
    const hasObj = typeof arg1 === 'object'
    const obj = hasObj ? arg1 : {}
    const message: any = hasObj ? arg2 : arg1
    this.log.error(message, obj)
  }

  public info(arg1: unknown, arg2?: unknown, ...other: unknown[]) {
    const hasObj = typeof arg1 === 'object'
    const obj = hasObj ? arg1 : {}
    const message: any = hasObj ? arg2 : arg1
    this.log.info(message, obj)
  }

  public trace(arg1: unknown, arg2?: unknown, ...other: unknown[]) {
    const hasObj = typeof arg1 === 'object'
    const obj = hasObj ? arg1 : {}
    const message: any = hasObj ? arg2 : arg1
    this.log.debug(message, obj)
  }

  public warn(arg1: unknown, arg2?: unknown, ...other: unknown[]) {
    const hasObj = typeof arg1 === 'object'
    const obj = hasObj ? arg1 : {}
    const message: any = hasObj ? arg2 : arg1
    this.log.warn(message, obj)
  }

  public silent() {
    // do nothing. its silent log entry
  }

  public get level() {
    return this.log.level
  }


  public child(bindings: Bindings): any {
    return this
  }
}
