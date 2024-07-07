import {NestedError as Error} from '../util/errors'
import {Module} from '../module'

export class InjectionError extends Error {
  public readonly module!: Module

  constructor(
    module: Module,
    message: string,
    nested?: Error,
  ) {
    super(message, nested)

    // Prevent `module` from being serialized to http responses, logs, etc.
    Object.defineProperty(this, 'module', {
      value: module,
      enumerable: false,
      writable: true,
    })
  }
}
