import {InjectModuleConfig} from '@silvertree/core'
import {IStorageRootModuleConfig} from './StorageRootModule'
import StorageManager from '../StorageManager'
import {IStorageDriver} from '../types'

export class StorageManagerService extends StorageManager {

  @InjectModuleConfig()
  protected readonly moduleConfig!: IStorageRootModuleConfig

  protected initialized = false

  /**
   * Bootstraps the storage driver service and registers all storage drivers from the configuration.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    this.initialized = true

    // register drivers
    for (const [name, driver] of Object.entries(this.moduleConfig.drivers)) {
      if ('prototype' in driver) {
        // this is a class
        // IDK why typescript still thinks that can be a dynamic import function
        this.registerDriver(name, driver as IStorageDriver)
        continue
      }

      // this is a function
      const driverClass: IStorageDriver = await (<any>driver)()
      this.registerDriver(name, driverClass)
    }

    // register disks
    for (const diskConfig of this.moduleConfig.discs) {

      // handle env configuration
      if (diskConfig.fromEnv) {
        const driver = this.drivers.get(diskConfig.driverName)
        if (!driver) {
          throw new Error(`Driver not found: ${diskConfig.driverName}`)
        }

        if (!('fromEnv' in driver)) {
          throw new Error(`Driver "${diskConfig.driverName}" does not support fromEnv method`)
        }

        // cannot get any abstractions for this, so just inline it
        const driverConfig = (<(prefix: string) => any>driver.fromEnv)(diskConfig.fromEnv)

        const driverName = process.env[diskConfig.fromEnv + 'TYPE'] || diskConfig.driverName
        if (!driverName) {
          throw new Error(`Missing environment variable: ${diskConfig.fromEnv + 'TYPE'}`)
        }

        this.registerDisk(diskConfig.name, {
          driver: driverName,
          config: driverConfig,
        })

        continue
      }

      // no env call
      this.registerDisk(diskConfig.name, {
        driver: diskConfig.driverName,
        config: diskConfig.config,
      })
    }

  }
}
