import {InjectModuleConfig} from '@silvertree/core'
import {IStorageRootModuleConfig} from './StorageRootModule'
import {StorageManager} from '../StorageManager'
import {IStorageDriver} from '../types'
import {resolvePackageNameFromErrorMessage} from './util'
import {StorageDriverError} from '../exceptions'

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
        /*
         install it because its already imported
         and will not cause importing optional dependencies which may not exist

         IDK why typescript still thinks that can be a dynamic import function
        */
        this.registerDriver(name, driver as IStorageDriver)
      }

      // this is a function aka dynamic import. we will install it only if it is used
    }

    // register disks and not dynamic imported drivers
    for (const diskConfig of this.moduleConfig.discs) {

      const driverName = diskConfig.fromEnv
        ? process.env[diskConfig.fromEnv + 'TYPE'] || diskConfig.driverName
        : diskConfig.driverName

      // handle missing driver name
      if (!driverName) {
        if (diskConfig.fromEnv) {
          throw new Error(`Missing driver name for disk: ${diskConfig.name} and environment variable: ${diskConfig.fromEnv + 'TYPE'} is not set`)
        }

        throw new Error(`Missing driver name for disk: ${diskConfig.name}`)
      }

      // handle not installed driver
      if (!this.drivers.has(driverName)) {
        // looking up for the driver from module configuration
        const driver = this.moduleConfig.drivers[driverName]
        if (!driver) {
          throw new Error(`Driver not found: ${driverName} (disc: ${diskConfig.name}). Did you forget to register it in the module configuration?`)
        }

        // all non async imported drivers already should be installed, but it with to check just in case
        if ('prototype' in driver) {
          // its disk class
          this.registerDriver(driverName, driver as IStorageDriver)
        } else {
          /*
           its dynamic import driver.
           may throw "package not found" error if one of the required dependencies is not installed.
          */
          try {
            const drv = await (<() => Promise<IStorageDriver>>driver)()
            this.registerDriver(driverName, drv)
          } catch (e: any) {
            // add a small hint in case if user forgot to install a package
            let message = `Error while importing driver: ${driverName} (disc: ${diskConfig.name}).`

            const lostPackage = resolvePackageNameFromErrorMessage(e.message)
            if (lostPackage) {
              message += ` Did you forget to install required package for this driver ${lostPackage}?`
            }

            throw new StorageDriverError(message, e)
          }
        }
      }

      // handle env configuration
      if (diskConfig.fromEnv) {
        const driver = this.drivers.get(driverName)
        if (!driver) {
          // should not happen normally
          throw new Error(`Driver not found: ${diskConfig.driverName} (unexpected behavior)`)
        }

        // user may pass a custom driver that may not have fromEnv static method
        if (!('fromEnv' in driver)) {
          throw new Error(`Driver "${diskConfig.driverName}" does not support fromEnv method`)
        }

        // cannot get any abstractions for this, so just inline it
        const driverEnvConfig = (<(prefix: string) => any>driver.fromEnv)(diskConfig.fromEnv) || {}

        // user may pass a custom driver that may not have fromEnv static method
        const driverUserConfig = diskConfig.config || {}

        // merge it on the top level
        const driverConfig = {
          ...driverEnvConfig,
          ...driverUserConfig,
        }

        this.registerDisk(diskConfig.name, {
          driver: driverName,
          config: driverConfig,
        })

        continue
      }

      // no env call
      this.registerDisk(diskConfig.name, {
        driver: driverName,
        config: diskConfig.config || {},
      })
    }

  }
}
