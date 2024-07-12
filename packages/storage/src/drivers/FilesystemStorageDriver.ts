import {StorageDriver} from '../StorageDriver'
import {DeleteResponse, FileListResponse, Response, StatResponse} from '../response-types'
import {normalizePath} from '../util'
import posixPath from 'node:path/posix'
import platformPath from 'node:path'
import fs from 'node:fs/promises'
import fss from 'node:fs'
import {ObjectNotFound, StorageDriverError} from '../exceptions'
import os from 'node:os'
import util from 'node:util'
import stream from 'node:stream'

export interface IFilesystemStorageDriverConfig {
  rootPath: string
}

/**
 * Filesystem storage driver.
 */
export class FilesystemStorageDriver extends StorageDriver<IFilesystemStorageDriverConfig, null> {


  /**
   * Create a new instance of the filesystem storage driver.
   *
   * `PREFIX_LOCAL_PATH` is the path to the storage.
   */
  public static fromEnv(envPrefix: string): Partial<IFilesystemStorageDriverConfig> {
    const path = process.env[`${envPrefix}LOCAL_PATH`]

    if (!path) {
      return {}
    }

    return {
      rootPath: path,
    }
  }

  public async append(location: string, content: Buffer | string): Promise<Response> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {
      const parentDir = posixPath.dirname(path)
      await fs.mkdir(parentDir, {recursive: true})
    } catch (e: any) {
      throw new StorageDriverError(`Failed to create parent directory: ${location}`, e)
    }

    try {
      await fs.appendFile(path, content)
    } catch (e: any) {
      throw new StorageDriverError(`Failed to append file: ${location}`, e)
    }

    return {raw: null}
  }

  public async copy(src: string, dest: string): Promise<Response> {
    const srcPath = posixPath.join(this.config.rootPath, normalizePath(src))
    const destPath = posixPath.join(this.config.rootPath, normalizePath(dest))

    if (srcPath === destPath) {
      return {raw: null}
    }

    try {
      await fs.access(srcPath)
    } catch (e: any) {
      throw new StorageDriverError(`Source file does not exist: ${src}`, e)
    }

    try {
      const parentDir = posixPath.dirname(destPath)
      await fs.mkdir(parentDir, {recursive: true})
    } catch (e: any) {
      throw new StorageDriverError(`Failed to create parent directory: ${destPath}`, e)
    }

    try {
      await fs.copyFile(srcPath, destPath)
    } catch (e: any) {
      throw new StorageDriverError(`Failed to copy file: ${src} to ${dest}`, e)
    }

    return {raw: null}
  }

  public async delete(location: string): Promise<DeleteResponse> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {
      await fs.unlink(path)
      return {raw: null, wasDeleted: true}

    } catch (e: any) {

      if (e.code === 'ENOENT') {
        return {raw: null, wasDeleted: false}
      }
      throw new StorageDriverError(`Failed to delete file: ${location}`, e)
    }
  }

  public async deleteRecursive(location: string): Promise<DeleteResponse> {
    const locationPath = normalizePath(location)
    const path = posixPath.join(this.config.rootPath, locationPath)

    try {
      await fs.rm(path, {
        force: true,
        recursive: true,
      })

      if (locationPath === '') {
        await fs.mkdir(this.config.rootPath)
      }

      return {raw: null, wasDeleted: true}

    } catch (e: any) {
      if (e.code === 'ENOENT') {
        return {raw: null, wasDeleted: false}
      }

      throw new StorageDriverError(`Failed to delete directory: ${location}`, e)
    }
  }

  public getDriver() {
    return null
  }

  public async exists(location: string): Promise<boolean> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {

      await fs.access(path)
      return true

    } catch (e: any) {

      if (e.code === 'ENOENT') {
        return false
      }

      throw new StorageDriverError(`Failed to check if file exists: ${location}`, e)
    }
  }

  public async get(location: string, encoding?: BufferEncoding): Promise<string> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    if (encoding && !Buffer.isEncoding(encoding)) {
      throw new StorageDriverError(`Invalid buffer encoding type provided: ${encoding}`)
    }

    if (!encoding) {
      encoding = 'utf-8'
    }

    try {
      return await fs.readFile(path, encoding as 'utf-8')
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        throw new ObjectNotFound(location, e)
      }

      throw new StorageDriverError(`Failed to read file: ${location}`, e)
    }
  }

  public async getBuffer(location: string): Promise<Buffer> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {
      return await fs.readFile(path)
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        throw new ObjectNotFound(location, e)
      }

      throw new StorageDriverError(`Failed to read file: ${location}`, e)
    }
  }

  public async getStat(location: string): Promise<StatResponse> {

    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {
      const stat = await fs.stat(path)
      return {
        raw: stat,
        size: stat.size,
        modified: stat.mtime,
      }
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        throw new ObjectNotFound(location, e)
      }

      throw new StorageDriverError(`Failed to get file stat: ${location}`, e)
    }
  }

  public async getStream(location: string): Promise<stream.Readable> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {
      return fss.createReadStream(path)
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        throw new ObjectNotFound(location, e)
      }

      throw new StorageDriverError(`Failed to read file: ${location}`, e)
    }
  }

  public async move(src: string, dest: string): Promise<Response> {
    const srcPath = posixPath.join(this.config.rootPath, normalizePath(src))
    const destPath = posixPath.join(this.config.rootPath, normalizePath(dest))

    if (srcPath === destPath) {
      return {raw: null}
    }

    try {
      await fs.access(srcPath)
    } catch (e: any) {
      throw new StorageDriverError(`Source file does not exist: ${src}`, e)
    }

    try {
      const parentDir = posixPath.dirname(destPath)
      await fs.mkdir(parentDir, {recursive: true})
    } catch (e: any) {
      throw new StorageDriverError(`Failed to create parent directory: ${destPath}`, e)
    }

    try {
      await fs.rename(srcPath, destPath)
    } catch (e: any) {
      throw new StorageDriverError(`Failed to move file: ${src} to ${dest}`, e)
    }

    return {raw: null}
  }

  public async put(location: string, content: Buffer | stream.Readable | string): Promise<Response> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    try {
      const parentDir = posixPath.dirname(path)
      await fs.mkdir(parentDir, {recursive: true})
    } catch (e: any) {
      throw new StorageDriverError(`Failed to create parent directory: ${location}`, e)
    }


    if (typeof content === 'string') {
      await fs.writeFile(path, content)
      return {raw: null}
    }

    if (Buffer.isBuffer(content)) {
      await fs.writeFile(path, content)
      return {raw: null}
    }

    // if it's a stream

    const writeStream = fss.createWriteStream(path)

    for await (const chunk of content) {
      writeStream.write(chunk)
    }

    writeStream.end()

    return {raw: null}
  }

  public async prepend(location: string, content: Buffer | string): Promise<Response> {
    const path = posixPath.join(this.config.rootPath, normalizePath(location))

    // if file does not exist, just put the content
    const exists = await this.exists(location)
    if (!exists) {
      return this.put(location, content)
    }

    // creating temp file to write and read from
    const tempDir = await fs.mkdtemp(posixPath.join(os.tmpdir(), 'svt-storage-'))
    const tempFilePath = posixPath.join(tempDir, 'prepend.tmp')
    const tempFile = await fs.open(tempFilePath, 'wx')
    const tempWriteStream = tempFile.createWriteStream({flush: true, autoClose: true})

    // write "prepend" content to temp file
    tempWriteStream.write(content as Buffer)

    // write existing content to temp file as stream
    const readStream = fss.createReadStream(path)
    readStream.pipe(tempWriteStream)

    // wait for the stream to finish
    await new Promise<void>((resolve, reject) => {
      readStream.on('end', () =>
        readStream.close(e => e ? reject(e) : resolve()),
      )
      readStream.on('error', e =>
        readStream.close(e2 => reject(e || e2)),
      )
    })

    await util.promisify(tempWriteStream.close.bind(tempWriteStream))()
    await tempFile.close()

    // put temp file content to original file
    await fs.copyFile(tempFilePath, path)

    await fs.rm(tempDir, {recursive: true})

    return {raw: null}
  }

  public async* listFilesRecursive(prefix?: string): AsyncIterable<FileListResponse<fss.Dirent>> {
    const prefixPath = normalizePath(prefix || '')
    const path = posixPath.join(this.config.rootPath, prefixPath)

    try {
      const files = await fs.readdir(path, {recursive: true, withFileTypes: true})

      for (const file of files) {
        if (!file.isFile()) {
          continue
        }
        const relativePath = platformPath.join(platformPath.relative(path, file.path), file.name)
        yield {
          raw: file,
          path: normalizePath(relativePath),
        }
      }
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        throw new ObjectNotFound(path, e)
      }

      throw new StorageDriverError(`Failed to list files: ${path}`, e)
    }
  }

  public async alive(): Promise<void> {
    // nothing to check
  }
}
