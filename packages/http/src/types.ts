import {fastify, FastifyInstance, FastifyListenOptions, RouteOptions} from 'fastify'
import {FastifyFormbodyOptions} from '@fastify/formbody'
import {
  FastifyMultipartAttachFieldsToBodyOptions,
  FastifyMultipartBaseOptions,
  FastifyMultipartOptions,
} from '@fastify/multipart'
import {FastifyAcceptsOptions} from '@fastify/accepts'
import {FastifyCookieOptions} from '@fastify/cookie'
import {FastifyCorsOptions, FastifyCorsOptionsDelegate} from '@fastify/cors'
import {Module, TBindKey, TBindKeyRef} from '@silvertree/core'
import {HttpRequestFiberModule} from './http-request-fiber-module'
import {TClassConstructor} from '@silvertree/core'

/**
 * A root http module for configuring the http server.
 */
export interface IHttpRootModuleConfig {
  /**
   * The scope of the root http module. You can use this to create multiple http servers.
   * @default 'default'
   */
  scope?: string
  /**
   * The port to listen on.
   * @default process.env.HTTP_{SCOPE}_PORT || process.env.HTTP_PORT || 8000
   */
  port?: number
  /**
   * The address to listen on.
   * @default process.env.HTTP_{SCOPE}_ADDRESS || process.env.HTTP_ADDRESS || '0.0.0.0'
   */
  address?: string
  /**
   * Additional options for `fastify.listen` method.
   */
  listenOptions?: FastifyListenOptions
  /**
   * The secret to use for signing cookies and other tools. Should be at least 32 hex characters long.
   * @default process.env.HTTP_{SCOPE}_SECRET || process.env.HTTP_SECRET || ''
   */
  secret?: string
  /**
   * The fastify configuration.
   * @see defaults `http-root-service.ts`
   * @see configuration ref https://fastify.dev/docs/latest/Reference/Server
   */
  fastify?: Parameters<typeof fastify>[0]
  /**
   * A function to configure the fastify instance. You can attach your fastify plugins here or add hooks, etc.
   * @param server
   */
  configureFastify?: (server: FastifyInstance) => void
  /**
   * If `true`, default fastify error handler will be used.
   * @default false
   */
  disableSilvertreeErrorHandling?: boolean
  /**
   * If `true`, http 5xx errors will be shown in response.
   * @default process.emv.NODE_ENV === 'development'
   */
  showHttp5xxErrorInResponse?: boolean
  /**
   * Module class for creating fiber modules for each request.
   */
  requestFiberModuleClass?: TClassConstructor<HttpRequestFiberModule>
  /**
   * Configuration for build-in plugins. Pass `false` to any of it to disable it.
   */
  plugins?: {
    /**
     * Configuration for `@fastify/formbody` plugin. Pass `false` to disable it.
     * @see defaults `http-root-service.ts`
     */
    formBody?: boolean | FastifyFormbodyOptions
    /**
     * Configuration for `@fastify/multipart` plugin. Pass `false` to disable it.
     * @see defaults `http-root-service.ts`
     */
    multipart?: boolean | FastifyMultipartBaseOptions | FastifyMultipartOptions | FastifyMultipartAttachFieldsToBodyOptions
    /**
     * Configuration for `@fastify/accepts` plugin. Pass `false` to disable it.
     * @see defaults `http-root-service.ts`
     */
    accepts?: boolean | FastifyAcceptsOptions
    /**
     * Configuration for `@fastify/cookie` plugin. Pass `false` to disable it.
     * @see defaults `http-root-service.ts`
     */
    cookie?: boolean | FastifyCookieOptions
    /**
     * Configuration for `@fastify/cors` plugin. Pass `false` to disable it.
     * @see defaults `http-root-service.ts`
     */
    cors?: boolean | FastifyCorsOptions
    /**
     * Configuration for `@fastify/routes` plugin. Pass `false` to disable it.
     * Enabled by default. If you disable it, you will not able to get list of registered routes from fastify instance.
     * @default true
     */
    routes?: boolean
  }
}

/**
 * A module for configuring the http server.
 */
export interface IHttpModuleConfig {
  /**
   * The scope of the http module which will be used to apply corresponded elements.
   * @default 'default'
   */
  scope?: string
  /**
   * If `true`, controllers and fastify decorators will be registered with `fastify.register` method.
   * @default true
   */
  useFastifyRegister?: boolean
  /**
   * Array of controllers to register.
   * These controllers should be already registered or imported in this module.
   */
  controllers?: Array<{ controller: TBindKey | TBindKeyRef }>
}


export interface IHttpControllerRegistrationTerm {
  controller: TBindKey | TBindKeyRef
  module: Module
  useFastifyRegister: boolean
}


export interface IHttpControllerRouteMetadataItem {
  /**
   * Method name
   */
  m: string
  /**
   * Route options
   */
  r: Omit<RouteOptions, 'handler'>
}

export interface IHttpControllerSetupMetadataItem {
  /**
   * Method name
   */
  m: string
}
