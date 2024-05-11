import {StorageDriver} from './StorageDriver'

/**
 * Storage constructor
 */
export interface IStorageDriver<T extends StorageDriver = StorageDriver> {
  new(config: any): T
}

export interface IStorageManagerSingleDiskConfig {
  driver: string | IStorageDriver
  config: any
}

export interface IStorageManagerConfig {
  /**
   * Default storage name
   * @default 'default'
   */
  default?: string
  /**
   * Storages configuration
   */
  disks: Record<string, IStorageManagerSingleDiskConfig>
  /**
   * Drivers configuration
   */
  drivers?: Record<string, IStorageDriver>
}
