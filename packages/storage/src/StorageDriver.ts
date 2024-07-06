import {MethodNotSupported} from './exceptions'
import {DeleteResponse, FileListResponse, Response, SignedUrlOptions, StatResponse} from './response-types'
import stream from 'node:stream'
import {IDisk} from './types'

export abstract class StorageDriver<C = any, D = any> implements IDisk<C, D> {

  constructor(
    protected config: C,
  ) {
  }

  public getConfig(): C {
    return this.config
  }

  public append(location: string, content: Buffer | string): Promise<Response> {
    throw new MethodNotSupported('append', this.constructor.name)
  }

  public async copy(src: string, dest: string): Promise<Response> {
    throw new MethodNotSupported('copy', this.constructor.name)
  }

  public async delete(location: string): Promise<DeleteResponse> {
    throw new MethodNotSupported('delete', this.constructor.name)
  }

  public async deleteRecursive(location: string): Promise<Response> {
    throw new MethodNotSupported('deleteRecursive', this.constructor.name)
  }

  /**
   * Returns the driver.
   */
  public getDriver(): D {
    throw new MethodNotSupported('driver', this.constructor.name)
  }

  /**
   * Determines if a file or folder already exists.
   *
   * NOTE: Prefer using `get*` and handle the error instead of using this method.
   */
  public exists(location: string): Promise<boolean> {
    throw new MethodNotSupported('exists', this.constructor.name)
  }


  public get(location: string, encoding?: BufferEncoding): Promise<string> {
    throw new MethodNotSupported('get', this.constructor.name)
  }

  public async getBuffer(location: string): Promise<Buffer> {
    throw new MethodNotSupported('getBuffer', this.constructor.name)
  }

  public async getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string> {
    throw new MethodNotSupported('getSignedUrl', this.constructor.name)
  }

  public async getStat(location: string): Promise<StatResponse> {
    throw new MethodNotSupported('getStat', this.constructor.name)
  }

  public getStream(location: string): Promise<stream.Readable> {
    throw new MethodNotSupported('getStream', this.constructor.name)
  }

  /**
   * Returns url for a given key. Note this method doesn't
   * validates the existence of file or it's visibility
   * status.
   */
  public getUrl(location: string): string {
    throw new MethodNotSupported('getUrl', this.constructor.name)
  }

  public async move(src: string, dest: string): Promise<Response> {
    throw new MethodNotSupported('move', this.constructor.name)
  }

  public async put(location: string, content: Buffer | stream.Readable | string): Promise<Response> {
    throw new MethodNotSupported('put', this.constructor.name)
  }

  public async prepend(location: string, content: Buffer | string): Promise<Response> {
    throw new MethodNotSupported('prepend', this.constructor.name)
  }

  public async* listFilesRecursive(prefix?: string): AsyncIterable<FileListResponse> {
    throw new MethodNotSupported('listFilesRecursive', this.constructor.name)
  }

  public async* listFiles(prefix?: string): AsyncIterable<FileListResponse> {
    throw new MethodNotSupported('listFiles', this.constructor.name)
  }

  public async alive(): Promise<void> {
    throw new MethodNotSupported('alive', this.constructor.name)
  }
}
