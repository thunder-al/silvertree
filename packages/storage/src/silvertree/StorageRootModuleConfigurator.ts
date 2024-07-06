import {Container, Module, TClassConstructor, TConfiguredModuleTerm} from '@silvertree/core'
import {IStorageRootModuleConfig, StorageRootModule} from './StorageRootModule'
import {StorageDriver} from '../StorageDriver'

const defaultDrivers: Record<string, TClassConstructor<StorageDriver> | (() => Promise<TClassConstructor<StorageDriver>>)> = {
  memory: () => import('../drivers/InMemoryStorageDriver').then(d => d.InMemoryStorageDriver),
  filesystem: () => import('../drivers/FilesystemStorageDriver').then(d => d.FilesystemStorageDriver),
  s3: () => import('../drivers/S3StorageDriver').then(d => d.S3StorageDriver),
}

export class StorageRootModuleConfigurator implements TConfiguredModuleTerm<StorageRootModule> {
  __isConfModuleTerm: true = true
  module = StorageRootModule
  strict = true

  configured = false

  /**
   * Registered disks
   */
  discs: Array<{
    name: string,
    driverName: string,
    config: any | ((container: Container) => any | Promise<any>),
    fromEnv?: null | string
  }> = []

  /**
   * Registered drivers
   */
  drivers: Record<string, TClassConstructor<StorageDriver> | (() => Promise<TClassConstructor<StorageDriver>>)> = {}

  /**
   * Functions to run after the module has been configured
   */
  afterFunction: Array<(config: IStorageRootModuleConfig, container: Container, module: Module<any> | null) => Promise<void>> = []

  defaultDisk: string | null = null

  config = (container: Container, module: Module<any> | null) => this.makeConfig(container, module)

  constructor(
    protected staticConfig: Partial<IStorageRootModuleConfig>,
  ) {
  }

  /**
   * Only for internal use: generating the configuration for the module.
   * **Do not call it from the app**
   */
  public async makeConfig(container: Container, module: Module<any> | null) {
    const config: IStorageRootModuleConfig = {
      defaultDiskName: this.defaultDisk || 'default',
      discs: [],
      drivers: this.drivers,
      scope: 'default',
      ...(this.staticConfig || {}),
    }

    // doing that because we need to wait for all (possible) discs to generate their config
    config.discs = await Promise.all(this.discs.map(async disc => {
      const discConfig = typeof disc.config === 'function'
        ? await disc.config(container)
        : disc.config

      return {
        name: disc.name,
        driverName: disc.driverName,
        config: discConfig,
        // will be handled at the moment of creating the disc
        fromEnv: disc.fromEnv,
      }
    }))

    // set default drivers if none are set
    if (Object.keys(config.drivers).length === 0) {
      config.drivers = defaultDrivers
    }

    // run after functions
    for (const call of this.afterFunction) {
      await call(config, container, module)
    }

    return config
  }

  /**
   * Configure the disc with the given name and driver
   */
  public configureDisk<
    Driver extends StorageDriver,
    Config extends Driver extends StorageDriver<infer C> ? C : any,
  >(
    diskName: string,
    driverName: string,
    config: Config | ((container: Container, parentMod: Module<any> | null) => Config | Promise<Config>),
  ) {

    if (this.configured) {
      throw new Error('Cannot add disk after module has been configured')
    }

    this.discs.push({
      name: diskName,
      driverName,
      config,
    })

    return this
  }

  /**
   * Configure the disc with the given name and driver,
   * and get the rest of the config from the environment.
   * See `fromEnv` static method in storage drivers.
   */
  public configureDiskFromEnv<
    Driver extends StorageDriver,
    Config extends Driver extends StorageDriver<infer C> ? C : any,
  >(
    diskName: string,
    defaultDriverName?: string,
    defaultConfig?: Partial<Config> | ((container: Container, parentMod: Module<any> | null) => Partial<Config> | Promise<Partial<Config>>),
  ) {

    if (this.configured) {
      throw new Error('Cannot add disk after module has been configured')
    }

    // generate a prefix for the environment variables
    const moduleScopeEnvPrefix = !this.staticConfig.scope || this.staticConfig.scope === 'default'
      ? ''
      : this.staticConfig.scope.toUpperCase().replace(/-/g, '_') + '_'

    const envPrefix = 'STORAGE_'
      // module scope
      + moduleScopeEnvPrefix
      // storage name
      + diskName.toUpperCase().replace(/-/g, '_') + '_'

    //'STORAGE_' + diskName.toUpperCase().replace(/-/g, '_') + '_'

    this.discs.push({
      name: diskName,
      driverName: defaultDriverName || '', // will throw an error later if it is not set and don't have an env variable
      config: defaultConfig || {},
      fromEnv: envPrefix,
    })

    return this
  }

  public defaultDiskName(name: string) {

    if (this.configured) {
      throw new Error('Cannot change default disk after module has been configured')
    }

    this.defaultDisk = name

    return this
  }

  public configureDriver(name: string, driver: TClassConstructor<StorageDriver> | (() => Promise<TClassConstructor<StorageDriver>>)) {

    if (this.configured) {
      throw new Error('Cannot register driver after module has been configured')
    }

    this.drivers[name] = driver

    return this
  }

  public after(
    fn: (config: IStorageRootModuleConfig, container: Container, module: Module<any> | null) => Promise<void>,
  ) {
    this.afterFunction.push(fn)

    return this
  }
}
