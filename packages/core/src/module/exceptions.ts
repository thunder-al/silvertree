import {bindingKeyToString, getModuleName} from './util'
import {Module} from './Module'
import {TBindKey} from '../types'

/**
 * Throws in general module errors.
 * For example, if a module tries to export non-existing binding.
 */
export class ModuleError extends Error {
  constructor(
    public readonly module: Module,
    message?: string,
  ) {
    super(message)
  }
}

/**
 * Throws on binding errors.
 * For example, if a module tries to bind sync factory for already
 * bound async factory or tries to provide async factory of async factory
 * or module don't have any bindings for given key.
 */
export class ModuleBindingError extends Error {
  constructor(
    public readonly module: Module,
    public readonly key: TBindKey,
    message?: string,
  ) {
    super(message)
  }
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
    `Binding "${bindingKeyToString(key)}" not found in bindings or aliases of module ${getModuleName(module)}. Maybe you forgot to import module or provide the value?`,
  )
}

export function makeAsyncToSyncProvidingError(
  mod: Module,
  key: TBindKey,
) {
  throw new ModuleBindingError(mod, key, `Cannot get async factory ${bindingKeyToString(key)} as sync in module ${getModuleName(mod)}. Use async method instead sync variant`)
}
