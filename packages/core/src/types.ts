import 'reflect-metadata'
import {Module} from './module'
import {AbstractSyncFactory} from './factory/AbstractSyncFactory'

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
export type TBindKeyRef = { (): TBindKey, __isBindRef: true }

/**
 * Additional context parameters for injection
 */
export interface IInjectOptions {
  constructorArgs?: Array<any>

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

export interface TProvideContext {
  key: TBindKey
  chain: Array<{ module: Module, factory: AbstractSyncFactory<any>, key: TBindKey }>
}
