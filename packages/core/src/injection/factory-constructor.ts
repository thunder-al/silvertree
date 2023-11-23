import {TClassConstructor, TProvideContext} from '../types'
import {getClassArgumentInjections} from './func'
import {Module} from '../module'
import {AbstractAsyncFactory, AbstractSyncFactory} from '../factory/AbstractSyncFactory'
import {InjectionError} from './exceptions'
import {bindingKeyToString} from '../module/util'
import {formatProvideChain, resolveBindingKey} from '../util'

/**
 * Creates an instance of class with injected constructor dependencies.
 * @param module
 * @param factory
 * @param cls
 * @param ctx
 */
export function getBindingArgumentsForClassConstructorSync<
  T = any,
  M extends Module = Module,
  F extends AbstractSyncFactory<T, M> = AbstractSyncFactory<T, M>,
>(
  module: M,
  factory: F,
  cls: TClassConstructor<T>,
  ctx: TProvideContext,
) {

  assertClassConstructorCircularDependency(module, factory, cls, ctx)

  const constructorInjects = getClassArgumentInjections(cls, null)

  const result: Record<number, any> = {
  }

  for (const inj of constructorInjects) {
    try {
      const key = resolveBindingKey(inj.k)
      result[inj.i] = module.provideSync(key as string, inj.o, ctx)
    } catch (e: any) {
      if (e instanceof InjectionError) {
        throw e
      }

      throw new InjectionError(
        module,
        `Failed to inject constructor argument #${inj.i} of class ${cls.name} with key ${bindingKeyToString(inj.k)}`,
        e,
      )
    }
  }

  const resultArgs: Array<any> = []

  for (const argPos in result) {
    resultArgs[argPos] = result[argPos]
  }

  return resultArgs
}

/**
 * Creates an instance of class with injected constructor dependencies asynchronously.
 * @param module
 * @param factory
 * @param cls
 * @param args class constructor static arguments
 * @param ctx
 */
export async function getBindingArgumentsForClassConstructorAsync<
  T = any,
  M extends Module = Module,
  F extends AbstractAsyncFactory<T, M> = AbstractAsyncFactory<T, M>,
  Args extends Record<number, any> = Record<number, any>,
>(
  module: M,
  factory: F,
  cls: TClassConstructor<T>,
  args: Args,
  ctx: TProvideContext,
) {

  assertClassConstructorCircularDependency(module, factory, cls, ctx)

  const constructorInjects = getClassArgumentInjections(cls, null)

  const result: Record<number, any> = {
    ...args,
  }

  await Promise.all(constructorInjects.map(async (inj) => {
    try {
      const key = resolveBindingKey(inj.k)
      result[inj.i] = await module.provideAsync(key as string, inj.o, ctx)
    } catch (e: any) {
      if (e instanceof InjectionError) {
        throw e
      }

      throw new InjectionError(
        module,
        `Failed to inject constructor argument #${inj.i} of class ${cls.name} with key ${bindingKeyToString(inj.k)}`,
        e,
      )
    }
  }))

  const resultArgs: Array<any> = []

  for (const argPos in result) {
    resultArgs[argPos] = result[argPos]
  }

  return resultArgs
}

function assertClassConstructorCircularDependency<
  T = any,
  M extends Module = Module,
  F extends AbstractAsyncFactory<T, M> | AbstractSyncFactory<T, M> = AbstractAsyncFactory<T, M> | AbstractSyncFactory<T, M>,
>(
  module: M,
  factory: F,
  cls: TClassConstructor<T>,
  ctx: TProvideContext,
) {
  const hasSameModuleFactory = ctx.chain.slice(0, ctx.chain.length - 2)
    .some(el => el.module === module && el.factory === factory && el.key === ctx.key)
  if (hasSameModuleFactory) {
    throw new InjectionError(
      module,
      `Circular dependency detected for class constructor ${cls.name} with key ${bindingKeyToString(ctx.key)} in chain ${formatProvideChain(ctx.chain)}. Use property inject instead.`,
    )
  }
}
