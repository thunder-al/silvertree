export interface Response<R = any> {
  raw: R
}

export interface ExistsResponse<R = any> extends Response<R> {
  exists: boolean
}

export interface ContentResponse<ContentType, Raw = any> extends Response<Raw> {
  content: ContentType
}

export interface SignedUrlOptions {
  /**
   * Expiration time of the URL.
   * It should be a number of seconds from now.
   * @default `900` (15 minutes)
   */
  expiry?: number
}

export interface StatResponse<R = any> extends Response<R> {
  size: number
  modified: Date
  etag?: string
}

export interface FileListResponse<R = any> extends Response<R> {
  path: string
}

export interface DeleteResponse<R = any> extends Response<R> {
  /**
   * `true` if a file was deleted, `false` if there was no file to delete.
   * `null` if no information about the file is available.
   */
  wasDeleted: boolean | null
}
