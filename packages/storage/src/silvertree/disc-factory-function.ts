import {IInjectOptions, InjectionError, Module, TProvideContext} from '@silvertree/core'
import {getStorageServiceInjectKey} from './util'
import {StorageManagerService} from './StorageManagerService'

export async function discFactoryFunction(
  module: Module,
  options: Partial<IInjectOptions> | null,
  ctx: TProvideContext,
) {
  if (!options || !options.disc || !options.scope) {
    throw new InjectionError(module, 'Cannot inject storage disc without its name or storage scope in inject options. Please use @InjectDisc decorator.')
  }

  const svcKey = getStorageServiceInjectKey(options.scope)
  const svc = await module.provideAsync<StorageManagerService>(svcKey, null, ctx)

  const discName: string = options.disc

  return svc.disk(discName)
}
