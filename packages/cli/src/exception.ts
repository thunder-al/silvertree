import {NestedError} from '@silvertree/core'

export class CliError extends NestedError {
}

export class CliCommandNotFoundError extends CliError {
  constructor(commandName: string, nestedError?: Error | null) {
    super(`Command "${commandName}" not found`, nestedError)
  }
}
