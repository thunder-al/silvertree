import {TBindKey} from './types'
import {bindingKeyToString, getModuleName} from './util'
import {Module} from './Module'

export class ModuleBindingError extends Error {
  constructor(
    public readonly module: Module,
    public readonly key: TBindKey,
    message?: string,
  ) {
    super(message)
  }
}

export class ModuleImportError extends Error {
  constructor(
    public readonly module: Module,
    public readonly importedModule: Module,
    message?: string,
  ) {
    super(message)
  }
}

/**
 * Throws if container doesn't have any *own* bindings or aliases with this key
 */
export function makeNoOwnBindingError(
  module: Module,
  key: TBindKey,
) {
  return new ModuleBindingError(
    module,
    key,
    `Binding "${bindingKeyToString(key)}" not found in own bindings or aliases of module ${getModuleName(module)}`,
  )
}

/**
 * Throws if container doesn't have any bindings or aliases with this key
 */
export function makeNoBindingError(
  module: Module,
  key: TBindKey,
) {
  return new ModuleBindingError(
    module,
    key,
    `Binding "${bindingKeyToString(key)}" not found in bindings or aliases of module ${getModuleName(module)}`,
  )
}
