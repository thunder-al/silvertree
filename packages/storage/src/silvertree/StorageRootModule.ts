import {Container, DynamicModule, TClassConstructor} from '@silvertree/core'
import {StorageDriver} from '../StorageDriver'
import {StorageRootModuleConfigurator} from './StorageRootModuleConfigurator'
import {StorageManagerService} from './StorageManagerService'
import {getStorageDiscInjectKey, getStorageServiceInjectKey} from './util'
import {discFactoryFunction} from './disc-factory-function'

export interface IStorageRootModuleConfig {
  /**
   * The scope of the root module. This is used to create a unique key for the root module's service.
   */
  scope?: string
  /**
   * List of the drivers with corresponding names.
   * Can be a driver class or an async import function.
   * If not set, `defaultDrivers` will be used (memory, filesystem, s3).
   */
  drivers: Record<string, TClassConstructor<StorageDriver> | (() => Promise<TClassConstructor<StorageDriver>>)>
  /**
   * Default disk name
   */
  defaultDiskName: string
  /**
   * Configuration for disks.
   */
  discs: Array<{ name: string, driverName: string, config: any, fromEnv?: null | string }>
}

export class StorageRootModule extends DynamicModule<IStorageRootModuleConfig> {

  constructor(
    container: Container,
    config: IStorageRootModuleConfig,
  ) {
    if (!config) {
      throw new Error('StorageModule: configuration is required')
    }

    if (!config.drivers) {
      throw new Error('StorageModule: storage drivers are required')
    }

    if (!config.discs) {
      throw new Error('StorageModule discs configuration is required')
    }

    super(container, config)
  }

  async setup() {

    const serviceBindKey = getStorageServiceInjectKey(this.config?.scope)
    const discFactoryBindKey = getStorageDiscInjectKey(this.config?.scope)

    // Register the storage manager service and initialize it when it constructed
    this.bind.singletonClass(StorageManagerService)
      .alias(serviceBindKey)
      .getFactory()
      .on('done', svc => svc.initialize())

    this.export(serviceBindKey)
    this.exportGlobal(serviceBindKey)

    // Register storage disc factory globally
    this.bind.functional(discFactoryBindKey, discFactoryFunction)
      .export({global: true})
  }

  public static configure(
    config: Partial<IStorageRootModuleConfig> = {},
  ): StorageRootModuleConfigurator {
    return new StorageRootModuleConfigurator(config)
  }

  /**
   * Configures module with default disk. Can be changed via env variables.
   */
  public static configureDefault(
    config: Partial<IStorageRootModuleConfig> = {},
  ): StorageRootModuleConfigurator {
    return StorageRootModule.configure(config)
      .configureDiskFromEnv('default', 'filesystem', {rootPath: './storage'})
  }

}

