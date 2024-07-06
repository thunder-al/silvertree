import {StorageDriver} from '../StorageDriver'
import {Client, ClientOptions, S3Error} from 'minio'
import {normalizePath} from '../util'
import {ObjectNotFound, StorageDriverError} from '../exceptions'
import {DeleteResponse, FileListResponse, Response, SignedUrlOptions, StatResponse} from '../response-types'
import * as stream from 'node:stream'
import type {BucketItemStat, CopyObjectResult, UploadedObjectInfo} from 'minio/src/internal/type'
import * as Path from 'node:path/posix'

export interface IS3StorageDriverConfig extends ClientOptions {
  /**
   * S3 bucket name
   */
  basket: string
  /**
   * Root path inside the bucket without leading and tailing slash.
   * If not defined, the root of the bucket will be used.
   */
  rootPath?: string
  /**
   * Alive check list path relative to `rootPath`.
   * If not defined, the driver will use the root path.
   */
  aliveCheckPath?: string
}

export class S3StorageDriver extends StorageDriver<IS3StorageDriverConfig, Client> {

  protected client: Client

  public constructor(config: IS3StorageDriverConfig) {
    super(config)
    this.processConfig()
    this.client = this.makeClient()
  }

  /**
   * Here is two ways to create a new S3StorageDriver instance:
   * 1. By passing url at `PREFIX_S3_CONNECTION_URL` environment variable with the following format:
   * ```
   * s3://<accessKey>:<secretKey>@<endPoint>[:<port>]/<bucket>[?rootPath=<rootPath>][&aliveCheckPath=<aliveCheckPath>][&useSSL=<useSSL>][&pathStyle=<pathStyle>][&sessionToken=<sessionToken>]
   * ```
   * 2. By passing the following environment variables:
   * * `PREFIX_S3_ACCESS_KEY` (required)
   * * `PREFIX_S3_SECRET_KEY` (required)
   * * `PREFIX_S3_ENDPOINT` (required)
   * * `PREFIX_S3_BUCKET` (required)
   * * `PREFIX_S3_ROOT_PATH`
   * * `PREFIX_S3_ALIVE_CHECK_PATH`
   * * `PREFIX_S3_USE_SSL` true/false
   * * `PREFIX_S3_PATH_STYLE` true/false
   * * `PREFIX_S3_SESSION_TOKEN`
   */
  public static fromEnv(envPrefix: string): Partial<IS3StorageDriverConfig> {
    function env(name: string) {
      return process.env[envPrefix + name]
    }

    if (env('CONNECTION_URL')) {
      const config: Partial<IS3StorageDriverConfig> = {}
      const url = new URL(env('CONNECTION_URL')!)

      if (url.protocol !== 's3:') {
        throw new StorageDriverError(`Invalid s3 connection url protocol. Expected s3, got ${url.protocol}`)
      }

      if (!url.username || !url.password) {
        throw new StorageDriverError('Missing access key or secret key in the connection url')
      }

      config.endPoint = url.hostname
      config.port = parseInt(url.port || '443')
      config.accessKey = url.username
      config.secretKey = url.password
      config.basket = url.pathname.slice(1)

      if (url.searchParams.has('rootPath')) {
        config.rootPath = url.searchParams.get('rootPath')!
      }

      if (url.searchParams.has('aliveCheckPath')) {
        config.aliveCheckPath = url.searchParams.get('aliveCheckPath')!
      }

      if (url.searchParams.has('useSSL')) {
        config.useSSL = url.searchParams.get('useSSL') !== 'false'
      }

      if (url.searchParams.has('sessionToken')) {
        config.sessionToken = url.searchParams.get('sessionToken')!
      }

      if (url.searchParams.has('pathStyle')) {
        config.pathStyle = url.searchParams.get('pathStyle') !== 'false'
      }

      return config
    }

    // if connection url is not defined, use individual env variables
    const config: Partial<IS3StorageDriverConfig> = {}

    const accessKey = env('ACCESS_KEY')
    if (accessKey) {
      config.accessKey = accessKey
    }

    const secretKey = env('SECRET_KEY')
    if (secretKey) {
      config.secretKey = secretKey
    }

    const endPoint = env('ENDPOINT')
    if (endPoint) {
      config.endPoint = endPoint
    }

    const port = env('PORT')
    if (port) {
      config.port = parseInt(port)
    }

    const basket = env('BUCKET')
    if (basket) {
      config.basket = basket
    }

    const rootPath = env('ROOT_PATH')
    if (rootPath) {
      config.rootPath = rootPath
    }

    const aliveCheckPath = env('ALIVE_CHECK_PATH')
    if (aliveCheckPath) {
      config.aliveCheckPath = aliveCheckPath
    }

    const useSSL = env('USE_SSL')
    if (useSSL) {
      config.useSSL = useSSL !== 'false'
    }

    const sessionToken = env('SESSION_TOKEN')
    if (sessionToken) {
      config.sessionToken = sessionToken
    }

    return config
  }

  protected processConfig() {
    if (this.config.rootPath) {
      try {
        this.config.rootPath = normalizePath(this.config.rootPath)
      } catch (err: any) {
        throw new StorageDriverError(`Invalid root path: ${this.config.rootPath}`, err)
      }
    }
  }

  /**
   * Creates a new S3 client.
   */
  protected makeClient() {
    return new Client(this.config)
  }

  /**
   * Normalizes the path by adding the root path if it's defined.
   */
  protected normalizePath(path: string) {
    const userPath = normalizePath(path)

    if (this.config.rootPath) {

      if (userPath.startsWith(this.config.rootPath)) {
        return userPath
      }

      return normalizePath(this.config.rootPath + '/' + userPath)
    }

    return userPath
  }

  protected wrapError(error: Error, objectPath: string) {

    if (error instanceof StorageDriverError) {
      return error
    }

    if (error instanceof S3Error) {
      if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
        return new ObjectNotFound(objectPath, error)
      }
    }

    return new StorageDriverError(error.message, error)
  }

  public async append(location: string, content: Buffer | string): Promise<Response<UploadedObjectInfo>> {
    const path = this.normalizePath(location)

    try {
      // if the source file exists, make a buffer and append the content

      const srcBuffer = await this.getBuffer(path)
      const destStream = new stream.PassThrough()

      const putPromise = this.put(location, destStream)

      // write the original content
      destStream.write(srcBuffer)

      // append the new content
      destStream.write(content)

      // end the stream
      destStream.end()

      return await putPromise

    } catch (e: any) {
      const err = this.wrapError(e, path)

      if (err instanceof ObjectNotFound) {

        // if source file does not exist, create a new file with the content
        return await this.put(location, content)

      } else {

        // if error is not ObjectNotFound, rethrow it
        throw err
      }
    }
  }

  public async copy(src: string, dest: string): Promise<Response<CopyObjectResult>> {
    const sourcePath = this.normalizePath(src)
    const destinationPath = this.normalizePath(dest)

    try {
      const copy = await this.client.copyObject(
        this.config.basket,
        destinationPath,
        `/${this.config.basket}/${sourcePath}`,
      )

      return {raw: copy}

    } catch (e: any) {
      throw this.wrapError(e, sourcePath)
    }
  }

  public async delete(location: string): Promise<DeleteResponse> {
    const path = this.normalizePath(location)

    try {
      await this.client.removeObject(this.config.basket, path)
    } catch (e: any) {
      throw this.wrapError(e, path)
    }

    return {raw: null, wasDeleted: null}
  }

  public async deleteRecursive(location: string): Promise<Response<null>> {
    const path = this.normalizePath(location)
    const deleteObjects: Array<string> = []

    const iter = this.listFilesRecursive(path)

    for await (const file of iter) {
      deleteObjects.push(this.normalizePath(file.path))
    }

    await this.client.removeObjects(this.config.basket, deleteObjects)

    return {raw: null}
  }

  public getDriver(): Client {
    return this.client
  }

  public async exists(location: string): Promise<boolean> {
    const path = this.normalizePath(location)

    try {

      await this.getStat(path)

      return true

    } catch (e: any) {
      const err = this.wrapError(e, path)

      if (err instanceof ObjectNotFound) {
        return false
      }

      throw e
    }
  }

  public async get(location: string, encoding?: BufferEncoding): Promise<string> {
    const path = this.normalizePath(location)
    const buffer = await this.getBuffer(path)
    return buffer.toString(encoding || 'utf-8')
  }

  public async getBuffer(location: string): Promise<Buffer> {
    const path = this.normalizePath(location)

    const stream = await this.getStream(path)

    return new Promise((resolve, reject) => {
      const buffer: Array<Buffer> = []

      // collect all chunks
      stream.on('data', (chunk) => {
        if (typeof chunk === 'string') {
          buffer.push(Buffer.from(chunk))
          return
        }

        if (Buffer.isBuffer(chunk)) {
          buffer.push(chunk)
          return
        }

        throw new StorageDriverError('Invalid chunk type: ' + typeof chunk)
      })

      // resolve the promise when the stream ends
      stream.on('end', () => {
        resolve(Buffer.concat(buffer))
      })

      // reject the promise when an error occurs
      stream.on('error', (error) => {
        reject(this.wrapError(error, path))
      })
    })
  }

  public getUrl(location: string): string {
    return (this.config.useSSL === false ? 'http' : 'https')
      // domain part
      + `://${this.config.endPoint}/`
      // basket part
      + `${this.config.basket}/`
      // object part
      + this.normalizePath(location)
  }

  public async getSignedUrl(location: string, options?: SignedUrlOptions): Promise<string> {
    const path = this.normalizePath(location)

    try {
      return await this.client.presignedUrl(
        'GET',
        this.config.basket,
        path,
        options?.expiry || 60_000 * 60, // 1 hour by default
      )
    } catch (e: any) {
      throw this.wrapError(e, path)
    }
  }

  public async getStat(location: string): Promise<StatResponse<BucketItemStat>> {
    const path = this.normalizePath(location)

    try {
      const stat = await this.client.statObject(this.config.basket, path)

      return {
        raw: stat,
        size: stat.size,
        modified: stat.lastModified,
        etag: stat.etag,
      }

    } catch (e: any) {
      throw this.wrapError(e, path)
    }
  }

  public async getStream(location: string): Promise<stream.Readable> {
    const path = this.normalizePath(location)

    try {
      return await this.client.getObject(this.config.basket, path)
    } catch (e: any) {
      throw this.wrapError(e, path)
    }
  }

  public async move(src: string, dest: string): Promise<Response> {
    const sourcePath = this.normalizePath(src)
    const destinationPath = this.normalizePath(dest)

    try {
      /**
       * S3 v1 copy
       * @see https://min.io/docs/minio/linux/developers/javascript/API.html#copyobject-targetbucketname-targetobjectname-sourcebucketnameandobjectname-conditions
       */
      const copy = await this.client.copyObject(
        this.config.basket,
        destinationPath,
        `/${this.config.basket}/${sourcePath}`,
      )

      await this.client.removeObject(
        this.config.basket,
        sourcePath,
      )

      return {raw: copy}

    } catch (e: any) {
      throw this.wrapError(e, sourcePath)
    }
  }

  public async put(location: string, content: Buffer | stream.Readable | string): Promise<Response<UploadedObjectInfo>> {
    const path = this.normalizePath(location)

    try {
      const raw = await this.client.putObject(this.config.basket, path, content)

      return {raw}

    } catch (e: any) {
      throw this.wrapError(e, path)
    }
  }

  public async prepend(location: string, content: Buffer | string): Promise<Response> {
    const path = this.normalizePath(location)

    try {
      // if the source file exists, make a buffer and prepend the content

      const srcBuffer = await this.getBuffer(path)
      const destStream = new stream.PassThrough()

      const putPromise = this.put(location, destStream)

      // prepend the new content
      destStream.write(content)

      // write the original content
      destStream.write(srcBuffer)

      // end the stream
      destStream.end()

      return await putPromise

    } catch (e: any) {
      const err = this.wrapError(e, path)

      if (err instanceof ObjectNotFound) {

        // if the source file does not exist, create a new file with the content
        return await this.put(location, content)

      } else {

        // if error is not ObjectNotFound, rethrow it
        throw err
      }
    }
  }

  public async* listFilesRecursive(prefix?: string): AsyncIterable<FileListResponse> {
    const path = this.normalizePath((prefix || '') + '/')
    const root = this.normalizePath('')

    try {
      const iter = this.client.listObjects(
        this.config.basket,
        path,
        true, // recursive
      )

      for await (const el of iter) {
        if (!el.name) {
          continue
        }

        yield {
          raw: el,
          path: Path.relative(root, el.name),
        }
      }

    } catch (e: any) {
      throw this.wrapError(e, path)
    }
  }

  public async* listFiles(prefix?: string): AsyncIterable<FileListResponse> {
    const path = this.normalizePath((prefix || '') + '/')
    const root = this.normalizePath('')

    try {
      const iter = this.client.listObjects(
        this.config.basket,
        path,
        false, // not recursive
      )

      for await (const el of iter) {
        if (!el.name) {
          continue
        }

        yield {
          raw: el,
          path: Path.relative(root, el.name),
        }
      }

    } catch (e: any) {
      throw this.wrapError(e, path)
    }
  }

  public async alive(): Promise<void> {
    const path = this.normalizePath(this.config.aliveCheckPath || '')
    try {
      const iter = this.listFiles(path)
      // trigger the iteration and return even if there are no files
      // noinspection LoopStatementThatDoesntLoopJS
      for await (const _ of iter) {
        return
      }
    } catch (e: any) {
      throw new StorageDriverError(`Failed to check if the driver is alive: stat ${path}`, e)
    }
  }
}

