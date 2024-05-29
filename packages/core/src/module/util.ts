import {TBindKey, TBindKeyRef, TClassConstructor} from '../types'
import {isClassInstance, resolveBindingKey} from '../util'
import {Module} from './Module'
import {Container} from '../container'

/**
 * Returns human-readable binding key, also resolves binding key reference to the actual binding key.
 * @param key
 */
export function bindingKeyToString(key: TBindKey | TBindKeyRef): string {

  key = resolveBindingKey(key)

  // string
  if (typeof key === 'string') {
    return `String(${key})`
  }

  // symbol
  if (typeof key === 'symbol') {
    return key.toString()
  }

  if (typeof key === 'function') {
    if ('constructor' in key) {

      // class
      const name: string = (<any>key).name || (<any>key).constructor?.name
      return `Class(${name})`

    } else {

      // function
      const name: string = (<Function>key).name
      return `Function(${name})`

    }
  }

  return `Unknown(${String(key)})`
}

/**
 * Returns human-readable module name.
 * @param module
 */
export function getModuleName(module: Module | TClassConstructor<Module> | Container): string {

  if (module instanceof Container) {
    return 'Container'
  }

  if (!module) {
    return 'ModuleIsUndefined'
  }

  if (isClassInstance(module)) {
    return module.constructor.name
  }

  return module.name
}

/**
 * Returns true if the module has any of the specified traits.
 */
export function isSvtModuleHasAnyTraits(module: any, traits: Array<'dynamic' | 'fiber' | string>): boolean {
  const constr: TClassConstructor<Module> = isClassInstance(module)
    ? module.constructor
    : module

  if ('__svt_module_traits' in constr && Array.isArray(constr.__svt_module_traits)) {
    const hasAny = constr.__svt_module_traits.some(trait => traits.includes(trait))
    if (hasAny) {
      return true
    }
  }

  // go deeper
  const parent = Object.getPrototypeOf(constr)

  // if null or empty object
  if (!parent || parent === Object.prototype) {
    return false
  }

  return isSvtModuleHasAnyTraits(parent, traits)
}

/**
 * Returns true if the module has all the specified traits.
 */
export function isSvtModuleHasEveryTraits(module: any, traits: Array<'dynamic' | 'fiber' | string>): boolean {
  const constr: TClassConstructor<Module> = isClassInstance(module)
    ? module.constructor
    : module

  if ('__svt_module_traits' in constr && Array.isArray(constr.__svt_module_traits)) {
    const currentTraits: Array<string> = constr.__svt_module_traits
    traits = traits.filter(trait => currentTraits.includes(trait))
    if (traits.length === 0) {
      return true
    }
  }

  // go deeper
  const parent = Object.getPrototypeOf(constr)

  // if null or empty object
  if (!parent || parent === Object.prototype) {
    return false
  }

  return isSvtModuleHasEveryTraits(parent, traits)
}

/**
 * Returns true if the module has the specified trait.
 */
export function isSvtModuleHasTrait(module: any, trait: 'dynamic' | 'fiber' | string): boolean {
  return isSvtModuleHasAnyTraits(module, [trait])
}
