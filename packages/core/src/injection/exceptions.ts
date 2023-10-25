import Error from 'nested-error-stacks'
import {Module} from '../module'

export class InjectionError extends Error {
  constructor(
    public readonly module: Module,
    message: string,
    public readonly nested?: Error,
  ) {
    super(message, nested)
  }
}
