import {StorageDriver} from './StorageDriver'
import {DeleteResponse, FileListResponse, Response, SignedUrlOptions, StatResponse} from './response-types'
import type stream from 'node:stream'

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
  disks?: Record<string, IStorageManagerSingleDiskConfig>
  /**
   * Drivers configuration
   */
  drivers?: Record<string, IStorageDriver>
}

/**
 * Disk is an instance of storage driver with its configuration
 */
export interface IDisk<C = any, D = any> {
  /**
   * Return the configuration of the disk.
   */
  getConfig(): C

  /**
   * Prepends content to a file.
   *
   * **WARNING**: It's inefficient as it copies the file to a temp file and then back to the original file.
   *   Try to avoid using this method at least for large files.
   */
  append(location: string, content: Buffer | string): Promise<Response>

  /**
   * Copy a file to a location.
   */
  copy(src: string, dest: string): Promise<Response>

  /**
   * Delete existing file.
   */
  delete(location: string): Promise<DeleteResponse>

  /**
   * Delete all files in a directory recursively.
   */
  deleteRecursive(location: string): Promise<Response>

  /**
   * Returns the instance of the driver behind this abstraction.
   * May return null if the driver is not available (e.g., not filesystem or memory driver)
   */
  getDriver(): D

  /**
   * Determines if a file or folder already exists.
   *
   * NOTE: Prefer using `get*` and handle the error instead of using this method.
   */
  exists(location: string): Promise<boolean>

  /**
   * Returns the file contents as a string.
   */
  get(location: string, encoding?: BufferEncoding): Promise<string>

  /**
   * Returns the file contents as a Buffer.
   */
  getBuffer(location: string): Promise<Buffer>

  /**
   * Returns the stream for the given file.
   */
  getStream(location: string): Promise<stream.Readable>

  /**
   * Returns signed url for an existing file.
   * This method **may not** check if the file exists.
   * This url should be available from the public internet without additional authentication.
   */
  getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string>

  /**
   * Return an url to the file.
   * This method **may not** check if the file exists.
   * This url **may not** be available from the public internet and **may** require additional authentication.
   */
  getUrl(location: string): string

  /**
   * Return file's size and modification date.
   */
  getStat(location: string): Promise<StatResponse>

  /**
   * Move file to a new location.
   */
  move(src: string, dest: string): Promise<Response>

  /**
   * Creates a new file.
   * This method will create missing directories on the fly.
   */
  put(location: string, content: Buffer | stream.Readable | string): Promise<Response>

  /**
   * Prepends content to a file.
   *
   * **WARNING**: It's inefficient as it copies the file to a temp file and then back to the original file.
   *   Try to avoid using this method at least for large files.
   */
  prepend(location: string, content: Buffer | string): Promise<Response>

  /**
   * List all files with a given prefix.
   */
  listFilesRecursive(prefix?: string): AsyncIterable<FileListResponse>

  /**
   * List all files in current directory.
   */
  listFiles(prefix?: string): AsyncIterable<FileListResponse>

  /**
   * Checks if the driver is alive or throw an exception.
   */
  alive(): Promise<void>
}
