import {NestedError} from '@silvertree/core'

type INestedErrorOptions = NonNullable<ConstructorParameters<typeof NestedError>[2]>

export class StorageDriverError extends NestedError {
  constructor(message: string, caused?: Error | null, options?: INestedErrorOptions) {
    super(message, caused, options)
  }
}

export class MethodNotSupported extends StorageDriverError {
  constructor(name: string, driver: string, caused?: Error | null, options?: INestedErrorOptions) {
    super(`Method ${name} is not supported for the driver ${driver}`, caused, options)
  }
}

export class InvalidConfig extends StorageDriverError {
}

export class ObjectNotFound extends StorageDriverError {
  constructor(location: string, caused?: Error | null, options?: INestedErrorOptions) {
    super(`Object not found at location ${location}`, caused, options)
  }
}

export class IllegalRelativePath extends StorageDriverError {
  constructor(path: string, caused?: Error | null, options?: INestedErrorOptions) {
    super(`Illegal relative path ${path}`, caused, options)
  }
}
