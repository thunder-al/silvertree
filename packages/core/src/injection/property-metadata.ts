import {TProvideContext} from '../types'
import {getClassPropertyInjections} from './func'
import {bindingKeyToString, Module} from '../module'
import {InjectionError} from './exceptions'
import {formatProvideChain, resolveBindingKey} from '../util'

export function injectBindingsForClassParameterSync<
  M extends Module = Module,
>(
  module: M,
  obj: any,
  ctx: TProvideContext,
) {
  if (ctx.chain.length > 512) {
    throw new InjectionError(
      module,
      `Too many injections in chain ${formatProvideChain(ctx.chain)}`,
    )
  }

  const injects = getClassPropertyInjections(obj)

  for (const inj of injects) {
    try {
      const key = resolveBindingKey(inj.k)
      obj[inj.p] = module.provideSync(key as string, inj.o, ctx)
    } catch (e: any) {
      if (e instanceof InjectionError) {
        throw e
      }

      throw new InjectionError(
        module,
        `Failed to inject property ${inj.p.toString()} of class ${obj.constructor.name} with key ${bindingKeyToString(inj.k)} in chain ${formatProvideChain(ctx.chain)}`,
        e,
      )
    }
  }
}

export async function injectBindingsForClassParameterAsync<
  M extends Module = Module,
>(
  module: M,
  obj: any,
  ctx: TProvideContext,
) {
  if (ctx.chain.length > 512) {
    throw new InjectionError(
      module,
      `Too many injections in chain ${formatProvideChain(ctx.chain)}`,
    )
  }

  const injects = getClassPropertyInjections(obj)

  await Promise.all(injects.map(async inj => {
    try {
      const key = resolveBindingKey(inj.k)
      obj[inj.p] = await module.provideAsync(key as string, inj.o, ctx)
    } catch (e: any) {
      if (e instanceof InjectionError) {
        throw e
      }

      throw new InjectionError(
        module,
        `Failed to inject property ${inj.p.toString()} of class ${obj.constructor.name} with key ${bindingKeyToString(inj.k)} in chain ${formatProvideChain(ctx.chain)}`,
        e,
      )
    }
  }))
}

