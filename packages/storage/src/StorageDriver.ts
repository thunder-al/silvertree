import {MethodNotSupported} from './exceptions'
import {
  ContentResponse,
  DeleteResponse,
  ExistsResponse,
  FileListResponse,
  Response,
  SignedUrlOptions,
  SignedUrlResponse,
  StatResponse,
} from './response-types'

export abstract class StorageDriver<C = any, D = any> {

  constructor(
    protected config: C,
  ) {
  }

  public getConfig(): C {
    return this.config
  }

  /**
   * Appends content to a file.
   */
  public append(location: string, content: Buffer | string): Promise<Response> {
    throw new MethodNotSupported('append', this.constructor.name)
  }

  /**
   * Copy a file to a location.
   */
  public async copy(src: string, dest: string): Promise<Response> {
    throw new MethodNotSupported('copy', this.constructor.name)
  }

  /**
   * Delete existing file.
   */
  public async delete(location: string): Promise<DeleteResponse> {
    throw new MethodNotSupported('delete', this.constructor.name)
  }

  /**
   * Delete all files in a directory.
   */
  public async deleteRecursive(location: string): Promise<Response> {
    throw new MethodNotSupported('deleteRecursive', this.constructor.name)
  }

  /**
   * Returns the driver.
   */
  public driver(): D {
    throw new MethodNotSupported('driver', this.constructor.name)
  }

  /**
   * Determines if a file or folder already exists.
   */
  public exists(location: string): Promise<boolean> {
    throw new MethodNotSupported('exists', this.constructor.name)
  }

  /**
   * Returns the file contents as a string.
   */
  public get(location: string, encoding?: string): Promise<string> {
    throw new MethodNotSupported('get', this.constructor.name)
  }

  /**
   * Returns the file contents as a Buffer.
   */
  public async getBuffer(location: string): Promise<Buffer> {
    throw new MethodNotSupported('getBuffer', this.constructor.name)
  }

  /**
   * Returns signed url for an existing file.
   */
  public async getSignedUrl(location: string, options?: SignedUrlOptions): Promise<SignedUrlResponse> {
    throw new MethodNotSupported('getSignedUrl', this.constructor.name)
  }

  /**
   * Returns file's size and modification date.
   */
  public async getStat(location: string): Promise<StatResponse> {
    throw new MethodNotSupported('getStat', this.constructor.name)
  }

  /**
   * Returns the stream for the given file.
   */
  public getStream(location: string): Promise<NodeJS.ReadableStream> {
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

  /**
   * Move file to a new location.
   */
  public async move(src: string, dest: string): Promise<Response> {
    throw new MethodNotSupported('move', this.constructor.name)
  }

  /**
   * Creates a new file.
   * This method will create missing directories on the fly.
   */
  public async put(location: string, content: Buffer | NodeJS.ReadableStream | string): Promise<Response> {
    throw new MethodNotSupported('put', this.constructor.name)
  }

  /**
   * Prepends content to a file.
   *
   * **WARNING**: It's pretty inefficient as it copies the file to a temp file and then back to the original file. Try to avoid using this method at least for large files.
   */
  public async prepend(location: string, content: Buffer | string): Promise<Response> {
    throw new MethodNotSupported('prepend', this.constructor.name)
  }

  /**
   * List all files with a given prefix.
   */
  public async* listFilesRecursive(prefix?: string): AsyncIterable<string> {
    throw new MethodNotSupported('list', this.constructor.name)
  }

  /**
   * Checks if the driver is alive or throw an exception.
   */
  public async alive(): Promise<void> {
    throw new MethodNotSupported('alive', this.constructor.name)
  }
}
