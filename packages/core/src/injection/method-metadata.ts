import {TClassConstructor, TProvideContext} from '../types'
import {getClassArgumentInjections} from './func'
import {Module} from '../module'
import {InjectionError} from './exceptions'
import {bindingKeyToString} from '../module/util'
import {formatProvideChain, resolveBindingKey} from '../util/keys'

/**
 * Creates an instance of class with injected constructor dependencies.
 * @param module
 * @param cls
 * @param methodName method name or null if constructor
 * @param args class constructor static arguments
 * @param ctx
 */
export function getBindingArgumentsForClassMethodSync<
  T = any,
  M extends Module = Module,
>(
  module: M,
  cls: TClassConstructor<T>,
  methodName: string | null,
  args: Record<number, any>,
  ctx: TProvideContext,
) {

  if (methodName === null) {
    assertClassConstructorCircularDependency(module, cls, ctx)
  }

  const injectMeta = getClassArgumentInjections(cls, methodName)

  const result: Record<number, any> = {
    ...args,
  }

  for (const inj of injectMeta) {
    try {
      const key = resolveBindingKey(inj.k)
      result[inj.i] = module.provideSync(key, inj.o, ctx)
    } catch (e: any) {
      if (e instanceof InjectionError) {
        throw e
      }

      throw new InjectionError(
        module,
        `Failed to inject ${methodName ?? 'constructor'} argument #${inj.i} of class ${cls.name} with key ${bindingKeyToString(inj.k)}`,
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
 * @param cls
 * @param methodName method name or null if constructor
 * @param args class constructor static arguments
 * @param ctx
 */
export async function getBindingArgumentsForClassMethodAsync<
  T = any,
  M extends Module = Module,
>(
  module: M,
  cls: TClassConstructor<T>,
  methodName: string | null,
  args: Record<number, any>,
  ctx: TProvideContext,
) {

  if (methodName === null) {
    assertClassConstructorCircularDependency(module, cls, ctx)
  }

  const injects = getClassArgumentInjections(cls, methodName)

  const result: Record<number, any> = {
    ...args,
  }

  await Promise.all(injects.map(async (inj) => {
    try {
      const key = resolveBindingKey(inj.k)
      result[inj.i] = await module.provideAsync(key, inj.o, ctx)
    } catch (e: any) {
      if (e instanceof InjectionError) {
        throw e
      }

      throw new InjectionError(
        module,
        `Failed to inject ${methodName ?? 'constructor'} argument #${inj.i} of class ${cls.name} with key ${bindingKeyToString(inj.k)}`,
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
>(
  module: M,
  cls: TClassConstructor<T>,
  ctx: TProvideContext,
) {
  const hasSameModuleFactory = ctx.chain.slice(0, ctx.chain.length - 2)
    .some(el => el.module === module && el.key === ctx.key)

  if (hasSameModuleFactory) {
    throw new InjectionError(
      module,
      `Circular dependency detected for class constructor ${cls.name} with key ${bindingKeyToString(ctx.key)} in chain ${formatProvideChain(ctx.chain)}. Use property inject instead.`,
    )
  }
}
