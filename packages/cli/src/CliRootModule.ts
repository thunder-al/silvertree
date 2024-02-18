import {configureModule, Container, Module} from '@silvertree/core'
import {ICliRootModuleConfig} from './types'
import {getRunnerCliServiceInjectKey, getRootCliServiceInjectKey} from './util'
import {CliRootService} from './CliRootService'
import {CliRunnerService} from './CliRunnerService'

export class CliRootModule extends Module<ICliRootModuleConfig> {

  async setup() {
    const svcKey = getRootCliServiceInjectKey(this.config?.scope)

    this.bind.syncSingletonClass(CliRootService).alias(svcKey)
    this.export(svcKey)
    this.exportGlobal(svcKey)

    const runnerKey = getRunnerCliServiceInjectKey(this.config?.scope)

    this.bind.syncSingletonClass(CliRunnerService).alias(runnerKey)
    this.export(runnerKey)
    this.exportGlobal(runnerKey)
  }

  static configured(
    config: ICliRootModuleConfig | ((container: Container, parentMod: Module | null) => ICliRootModuleConfig | Promise<ICliRootModuleConfig>),
  ) {
    return configureModule(CliRootModule, typeof config === 'object' ? () => config : config)
  }
}
