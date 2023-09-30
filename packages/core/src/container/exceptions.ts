import {Container} from './Container'
import {TContainerKey} from './types'
import {bindingToString, getContainerName} from './util'

export class ContainerBindingError extends Error {
  constructor(
    public readonly container: Container,
    public readonly key: TContainerKey,
    message?: string,
  ) {
    super(message)
  }
}

export class ContainerImportError extends Error {
  constructor(
    public readonly container: Container,
    public readonly importedContainer: Container,
    message?: string,
  ) {
    super(message)
  }
}

/**
 * Throws if container doesn't have any *own* bindings or aliases with this key
 */
export function makeNoOwnBindingError(
  container: Container,
  key: TContainerKey,
) {
  return new ContainerBindingError(
    container,
    key,
    `Binding "${bindingToString(key)}" not found in own bindings or aliases of container ${getContainerName(container)}`,
  )
}

/**
 * Throws if container doesn't have any bindings or aliases with this key
 */
export function makeNoBindingError(
  container: Container,
  key: TContainerKey,
) {
  return new ContainerBindingError(
    container,
    key,
    `Binding "${bindingToString(key)}" not found in bindings or aliases of container ${getContainerName(container)}`,
  )
}
