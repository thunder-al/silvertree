import {FactoryBindContext} from './FactoryBindContext'
import {Module} from '../module'

import {IInjectOptions, TBindKey, TProvideContext} from '../types'

/**
 * A factory interface that produces an entity of type T
 */
export interface ISyncFactory<
  T,
  M extends Module = Module,
> {

  /**
   * Returns injected object
   */
  get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): T

  /**
   * Creates a context for current factory
   * @param module
   * @param key
   */
  makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this>

  /**
   * Returns module of current factory
   */
  getModule(): M
}

/**
 * An async factory interface that produces an entity of type T
 */
export interface IAsyncFactory<
  T,
  M extends Module = Module
> {

  /**
   * Returns injected object
   */
  get(
    module: M,
    options: Partial<IInjectOptions> | null,
    ctx: TProvideContext,
  ): Promise<T>

  /**
   * Creates a context for current factory
   * @param module
   * @param key
   */
  makeBindContext(module: M, key: TBindKey): FactoryBindContext<M, T, this>

  /**
   * Returns module of current factory
   */
  getModule(): M
}
