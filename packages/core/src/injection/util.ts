import {Module} from '../module'
import {IInjectOptions, TBindKey, TClassConstructor, TProvideContext} from '../types'
import {getBindingArgumentsForClassMethodAsync, getBindingArgumentsForClassMethodSync} from './method-metadata'

/**
 * Calls a class method with injected arguments from the module.
 * Tip: You can use different module for providing arguments.
 */
export function callClassMethodWithSyncInjections<
  ReturnType = any,
  T extends Record<string, Function> = Record<string, Function>,
  M extends Module = Module,
>(
  module: M,
  key: TBindKey,
  instance: T,
  methodName: string,
  args: Record<number, any> = {},
  ctx: TProvideContext = {chain: [], key},
): ReturnType {

  const cls = instance.constructor as TClassConstructor<T>

  const functionArgs = {
    ...args,
    ...getBindingArgumentsForClassMethodSync(module, cls, methodName, args, ctx),
  }

  const orderedArgs = Object.entries(functionArgs)
    .map(el => [parseInt(el[0]), el[1]])
    .sort((a, b) => a[0] - b[0])
    .map(el => el[1])

  return instance[methodName].apply(instance, orderedArgs)
}

/**
 * Calls a class method with injected arguments from the module.
 * Tip: You can use different module for providing arguments.
 */
export async function callClassMethodWithAsyncInjections<
  ReturnType = any,
  T extends Record<string, Function> = Record<string, Function>,
  M extends Module = Module,
>(
  module: M,
  key: TBindKey,
  instance: T,
  methodName: string,
  args: Record<number, any> = {},
  ctx: TProvideContext = {chain: [], key},
): Promise<Awaited<ReturnType>> {

  const cls = instance.constructor as TClassConstructor<T>

  const functionArgs = {
    ...args,
    ...await getBindingArgumentsForClassMethodAsync(module, cls, methodName, args, ctx),
  }

  const orderedArgs = Object.entries(functionArgs)
    .map(el => [parseInt(el[0]), el[1]])
    .sort((a, b) => a[0] - b[0])
    .map(el => el[1])

  return await instance[methodName].apply(instance, orderedArgs)
}
