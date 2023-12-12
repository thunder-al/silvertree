import type {Module} from './module'
import type {AbstractSyncFactory} from './factory'
import type {Container} from './container'

/**
 * Helper type for a class constructor.
 */
export type TClassConstructor<T = any, C extends Array<any> = Array<any>>
  = { new(...args: C): T }

/**
 * A binding key for providing or injecting a resource.
 */
export type TBindKey<T = any> = string | TClassConstructor<T> | symbol

/**
 * A binding key reference.
 */
export type TBindKeyRef<T = any> = { (): TBindKey<T>, __isBindRef: true }

export type TConfiguredModuleTerm<
  M extends Module,
  C extends Container = Container,
  MP extends Module | null = Module,
  Cfg = M extends Module<infer Cfg> ? Cfg : any,
> = {
  module: TClassConstructor<M>,
  config: (container: C, module: MP | null) => Promise<Cfg> | Cfg,
  __isConfModuleTerm: true,
  strict: boolean
}

/**
 * Additional context parameters for injection
 */
export interface IInjectOptions {
  [ley: string]: any
}

export interface TClassInjectPropertyMetadataItem {
  /**
   * The binding key or alias.
   */
  k: TBindKey | TBindKeyRef

  /**
   * The property name.
   */
  p: string | symbol

  /**
   * Inject options.
   */
  o: Partial<IInjectOptions> | null
}

export interface TClassInjectArgumentMetadataItem {
  /**
   * The binding key or alias.
   */
  k: TBindKey | TBindKeyRef

  /**
   * The property (method) name.
   * If null, then it is a constructor parameter.
   */
  p: string | symbol | null

  /**
   * The argument index.
   */
  i: number

  /**
   * Inject options.
   */
  o: Partial<IInjectOptions> | null
}

/**
 * Context for providing an entity.
 * Used to detect circular dependencies and injection/providing chain discovery.
 */
export interface TProvideContext {
  key: TBindKey
  chain: Array<{ module: Module, factory: AbstractSyncFactory<any>, key: TBindKey }>
}
