import {StorageDriver} from '../StorageDriver'
import {DeleteResponse, FileListResponse, Response, StatResponse} from '../response-types'
import {ObjectNotFound, StorageDriverError} from '../exceptions'
import stream, {Readable} from 'node:stream'
import {normalizePath} from '../util'


/**
 * In-memory storage driver. Useful for testing.
 * It does not persist data between runs, DO NOT USE IN PRODUCTION.
 */
export class InMemoryStorageDriver extends StorageDriver<null, null> {

  protected readonly blobs: Map<string, string | Buffer> = new Map()

  public async append(location: string, content: Buffer | string): Promise<Response> {
    const path = normalizePath(location)
    const existingData = this.blobs.get(path) || Buffer.alloc(0)

    if (typeof existingData === 'string') {
      this.blobs.set(path, existingData + content)
    } else {
      this.blobs.set(path, Buffer.concat([existingData, Buffer.from(content)]))
    }

    return {raw: null}
  }

  public async copy(src: string, dest: string): Promise<Response> {
    const srcPath = normalizePath(src)
    const destPath = normalizePath(dest)

    const srcData = this.blobs.get(srcPath)
    if (!srcData) {
      throw new ObjectNotFound(src)
    }

    this.blobs.set(destPath, srcData)

    return {raw: null}
  }

  public async delete(location: string): Promise<DeleteResponse> {
    const path = normalizePath(location)

    if (this.blobs.has(path)) {
      this.blobs.delete(path)
      return {raw: null, wasDeleted: true}
    }

    return {raw: null, wasDeleted: false}
  }

  public async deleteRecursive(location: string): Promise<Response> {
    const path = normalizePath(location)

    for (const key of this.blobs.keys()) {
      if (key.startsWith(path)) {
        this.blobs.delete(key)
      }
    }

    return {raw: null}
  }

  public getDriver(): null {
    // there is no real driver
    return null
  }

  public async exists(location: string): Promise<boolean> {
    const path = normalizePath(location)

    if (path === '') {
      return true
    }

    const fileExists = this.blobs.has(path)
    if (fileExists) {
      return true
    }

    for (const key of this.blobs.keys()) {
      if (key.startsWith(path + '/')) {
        return true
      }
    }

    return false
  }

  public async get(location: string, encoding?: BufferEncoding): Promise<string> {
    const data = this.blobs.get(normalizePath(location))
    if (!data) {
      throw new ObjectNotFound(location)
    }

    if (typeof data === 'string') {
      return data
    }

    if (encoding && !Buffer.isEncoding(encoding)) {
      throw new StorageDriverError(`Invalid buffer encoding type provided: ${encoding}`)
    }

    return data.toString(encoding as BufferEncoding)
  }

  public async getBuffer(location: string): Promise<Buffer> {
    const data = this.blobs.get(normalizePath(location))
    if (!data) {
      throw new ObjectNotFound(location)
    }

    if (typeof data === 'string') {
      return Buffer.from(data)
    }

    return data
  }

  public async getStat(location: string): Promise<StatResponse> {
    const path = normalizePath(location)

    if (!this.blobs.has(path)) {
      throw new ObjectNotFound(location)
    }

    const data = this.blobs.get(path)!

    return {
      raw: null,
      size: typeof data === 'string' ? -data.length : Buffer.byteLength(data),
      modified: new Date(),
    }
  }

  public async getStream(location: string): Promise<stream.Readable> {
    const data = this.blobs.get(normalizePath(location))
    if (!data) {
      throw new ObjectNotFound(location)
    }

    const buffer = typeof data === 'string' ? Buffer.from(data) : data

    return Readable.from(buffer, {autoDestroy: true})
  }

  public getUrl(location: string): string {
    return super.getUrl(location)
  }

  public async move(src: string, dest: string): Promise<Response> {
    const srcPath = normalizePath(src)
    const destPath = normalizePath(dest)

    const srcData = this.blobs.get(srcPath)
    if (!srcData) {
      throw new ObjectNotFound(src)
    }

    this.blobs.set(destPath, srcData)
    this.blobs.delete(srcPath)

    return {raw: null}
  }

  public async put(location: string, content: Buffer | stream.Readable | string): Promise<Response> {
    const path = normalizePath(location)

    if (typeof content === 'string') {
      this.blobs.set(path, content)
      return {raw: null}
    }

    if (Buffer.isBuffer(content)) {

      this.blobs.set(path, content)
      return {raw: null}
    }

    // if it's a stream
    const chunks: Array<Buffer> = []

    for await (const chunk of content) {
      // noinspection SuspiciousTypeOfGuard
      if (typeof chunk === 'string') {
        chunks.push(Buffer.from(chunk))
      } else {
        chunks.push(chunk)
      }

      const buffer = Buffer.concat(chunks)

      this.blobs.set(path, buffer)
    }

    return {raw: null}
  }

  public async prepend(location: string, content: Buffer | string): Promise<Response> {
    const path = normalizePath(location)
    const existingData = this.blobs.get(path)
    if (!existingData) {
      throw new ObjectNotFound(location)
    }

    if (typeof existingData === 'string') {
      this.blobs.set(path, content + existingData)
    } else {
      this.blobs.set(path, Buffer.concat([Buffer.from(content), existingData]))
    }

    return {raw: null}
  }

  public async* listFilesRecursive(prefix?: string): AsyncIterable<FileListResponse> {
    const normalizedPrefix = normalizePath(prefix || '')

    for (const key of this.blobs.keys()) {
      if (key.startsWith(normalizedPrefix)) {
        yield {
          raw: null,
          path: key,
        }
      }
    }
  }

  public async alive(): Promise<void> {
    // nothing to check
  }
}
