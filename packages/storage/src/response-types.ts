export interface Response {
  raw: any
}

export interface ExistsResponse extends Response {
  exists: boolean
}

export interface ContentResponse<ContentType> extends Response {
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

export interface SignedUrlResponse extends Response {
  signedUrl: string
}

export interface StatResponse extends Response {
  size: number
  modified: Date
}

export interface FileListResponse extends Response {
  path: string
}

export interface DeleteResponse extends Response {
  /**
   * `true` if a file was deleted, `false` if there was no file to delete.
   * `null` if no information about the file is available.
   */
  wasDeleted: boolean | null
}
