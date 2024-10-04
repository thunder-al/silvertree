import {StorageDriver} from './StorageDriver'
import {InvalidConfig} from './exceptions'
import {IStorageDriver, IStorageManagerConfig, IStorageManagerSingleDiskConfig} from './types'

export class StorageManager {

  /**
   * Registered disks (instances of a storage driver)
   */
  protected readonly disks: Map<string, StorageDriver> = new Map()

  /**
   * Disk configurations
   */
  protected readonly disksConfig: Map<string, IStorageManagerSingleDiskConfig> = new Map()

  /**
   * Storage constructors
   */
  protected readonly drivers: Map<string, IStorageDriver> = new Map()

  /**
   * Disk default name
   * @default 'default'
   */
  protected defaultStorageName: string

  constructor(
    protected readonly config: IStorageManagerConfig = {},
  ) {
    this.defaultStorageName = config.default ?? 'default'

    if (config.drivers) {
      for (const [name, driver] of Object.entries(config.drivers)) {
        this.registerDriver(name, driver)
      }
    }

    if (config.disks) {
      for (const [name, diskConfig] of Object.entries(config.disks)) {
        this.registerDisk(name, diskConfig)
      }
    }

  }

  /**
   * Register a storage driver
   */
  public registerDriver(name: string, driver: IStorageDriver): this {
    this.drivers.set(name, driver)
    return this
  }

  /**
   * Register a disk configuration
   */
  public registerDisk(name: string, config: IStorageManagerSingleDiskConfig, options?: { override?: boolean }): void {
    if (options?.override && this.disksConfig.has(name)) {
      throw new InvalidConfig('Disk already registered')
    }

    if (this.disks.has(name)) {
      throw new InvalidConfig('Disk already instantiated, you cannot override its configuration')
    }

    if (typeof config.driver === 'string' && !this.drivers.has(config.driver)) {
      throw new InvalidConfig(`Driver ${config.driver} not registered`)
    }

    this.disksConfig.set(name, config)
  }

  /**
   * Get the instantiated disks
   */
  public getDisks() {
    return this.disks
  }

  /**
   * Get a disk instance.
   */
  public disk<T extends StorageDriver = StorageDriver>(name?: string): T {
    name = name || this.defaultStorageName

    // return the storage if it is already instantiated
    if (this.disks.has(name)) {
      return this.disks.get(name) as T
    }

    const config = this.disksConfig.get(name)

    if (!config) {
      throw new InvalidConfig(`Disk configuration not found for ${name}`)
    }

    if (!config.driver) {
      throw new InvalidConfig(`Disk configuration ${name} does not have a driver`)
    }

    const driver = typeof config.driver === 'string'
      ? this.drivers.get(config.driver)
      : config.driver

    if (!driver) {
      throw new InvalidConfig(`Disk configuration ${name} does uses not a valid driver`)
    }

    const disk = new driver(config.config)

    this.disks.set(name, disk)

    return disk as T
  }
}
