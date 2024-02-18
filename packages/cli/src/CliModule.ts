import {
  configureModule,
  Container,
  DynamicModule,
  getModuleName,
  Module,
  NestedError,
  resolveBindingKey,
} from '@silvertree/core'
import {CliRunnerService} from './CliRunnerService'
import {getRunnerCliServiceInjectKey} from './util'
import {ICliModuleConfig} from './types'

export class CliModule extends DynamicModule<ICliModuleConfig> {

  public async setup() {
    let svc: CliRunnerService

    if (!(this.importer instanceof Module)) {
      throw new Error(`CliModule can only be imported by a Module`)
    }

    try {
      svc = this.provideSync(getRunnerCliServiceInjectKey(this.config?.scope))
    } catch (e: any) {
      throw new NestedError(`Cannot find CliRegistrarService. Did you forget to import CliRootModule?`, e)
    }

    if (!this.config?.handlers) {
      throw new Error(`No handlers for CliModule from ${getModuleName(this.importer)}`)
    }

    for (const handler of this.config.handlers) {
      const key = resolveBindingKey(handler)
      if (!this.hasOwnBindOrAlias(key)) {
        this.importer.bind.singletonClass(handler as any)
      }

      svc.registerCommandsFromHandler(this.importer, key)
    }
  }

  static configured(
    config: ICliModuleConfig | ((container: Container, parentMod: Module | null) => ICliModuleConfig | Promise<ICliModuleConfig>),
  ) {
    return configureModule(CliModule, typeof config === 'object' ? () => config : config)
  }
}
