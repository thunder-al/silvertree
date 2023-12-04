// Original module: nested-error-stacks by mdlavin. See https://github.com/mdlavin/nested-error-stacks

interface INestedErrorOptions {
  /**
   * If `false`, messages of all nested errors will be omitted from an original error message.
   * @default true
   */
  messageCause?: boolean
  /**
   * If `false`, stack traces of all nested errors will be omitted from an original stack trace.
   * @default true
   */
  nestedStack?: boolean
}

/**
 * An error that can be nested inside another error.
 * @see test/errors.test.ts
 */
export class NestedError extends Error {
  public options!: INestedErrorOptions
  public readonly caused!: Error | null
  public readonly originalMessage!: string

  constructor(
    message: string,
    caused?: Error | null,
    options: INestedErrorOptions = {},
  ) {
    super(message)
    this.originalMessage = message
    this.name = 'NestedError'
    caused ??= null

    // Prevent `options` and `caused` from being serialized to http responses, logs, etc.
    Object.defineProperty(this, 'options', {
      value: options,
      enumerable: false,
      writable: true,
    })
    Object.defineProperty(this, 'caused', {
      value: caused,
      enumerable: false,
      writable: true,
    })

    this.message = buildMessage(this, caused, message)

    Error.captureStackTrace(this, this.constructor)
    const oldStackDescriptor = Object.getOwnPropertyDescriptor(this, 'stack')!
    const newStackDescriptor = buildStackDescriptor(this, oldStackDescriptor, caused)
    Object.defineProperty(this, 'stack', newStackDescriptor)
  }
}

function buildMessage(error: NestedError, caused: Error | null, message: string) {
  if (!(error.options.messageCause ?? true)) {
    return message
  }

  if (caused) {
    return `${message}\nCause: ${caused.name}: ${caused.message}`
  }

  return message
}

function buildStackDescriptor(
  error: NestedError,
  oldStackDescriptor: PropertyDescriptor,
  caused: Error | null,
): PropertyDescriptor {
  if (oldStackDescriptor.get) {
    return {
      get() {
        const stack = oldStackDescriptor.get!.call(error)
        return buildStack(error, stack, caused)
      },
    }
  }

  const stack = oldStackDescriptor.value
  return {
    value: buildStack(error, stack, caused),
  }
}

function buildStack(error: NestedError, stack: string, caused: Error | null): string {
  if (!(error.options.nestedStack ?? true)) {
    return stack
  }

  if (caused) {
    return `${stack}\nCaused By: ${caused.stack}`
  }

  return stack
}

/**
 * Extracts the original error message from a nested error. Can be used with any types of errors.
 * @example
 * const defaultError = new Error('bar')
 * const err = new NestedError('foo', defaultError)
 *
 * // regular error
 * defaultError.message // 'bar'
 * extractErrorMessage(defaultError) // 'bar'
 *
 * // nested error
 * err.message // 'foo\nCause: Error: bar'
 * extractErrorMessage('foo') // 'foo'
 */
export function extractErrorMessage(err: Error) {
  if (err instanceof NestedError) {
    return err.originalMessage
  }

  return err.message
}
