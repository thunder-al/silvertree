import {Inject, InjectModule, InjectModuleConfig, Module, objectPick} from '@silvertree/core'
import {IHttpRootModuleConfig} from './types'
import {FastifyLoggerAdapter} from './FastifyLoggerAdapter'
import {fastify, FastifyInstance} from 'fastify'
import fastifyFormBody from '@fastify/formbody'
import fastifyMultipart from '@fastify/multipart'
import fastifyAccepts from '@fastify/accepts'
import fastifyCors from '@fastify/cors'
import fastifyRoutes from '@fastify/routes'
import fastifyCookie from '@fastify/cookie'
import {InjectLogger, Logger} from '@silvertree/logging'
import {HttpRootRegistrarService} from './HttpRootRegistrarService'

const defaultFastifyConfig: Parameters<typeof fastify>[0] = {
  disableRequestLogging: true,
  return503OnClosing: true,
  ignoreDuplicateSlashes: true,
  ignoreTrailingSlash: true,
  ajv: {
    customOptions: {
      allowUnionTypes: true,
      removeAdditional: 'all',
    },
  },
}

export class HttpRootService {
  @InjectModuleConfig()
  protected readonly config?: IHttpRootModuleConfig

  @InjectModule()
  protected readonly module!: Module

  @Inject(FastifyLoggerAdapter)
  protected readonly httpLogger!: FastifyLoggerAdapter

  @InjectLogger()
  protected readonly logger!: Logger

  protected isStarted = false

  protected server?: FastifyInstance

  constructor() {
    if (typeof process !== 'undefined' && typeof process.on !== 'undefined') {
      process.on('SIGINT', () => this.stopHttpServer())
      process.on('SIGHUP', () => this.stopHttpServer())
      process.on('SIGTERM', () => this.stopHttpServer())
    }
  }

  /**
   * Creates a new Fastify instance.
   * @protected
   */
  public createHttpServer() {
    if (this.server) {
      throw new Error('HttpServer already created')
    }

    this.server = fastify({
      logger: this.httpLogger,
      ...defaultFastifyConfig,
      ...(this.config?.fastify ?? {}),
    })

    this.applyFastifyPlugins(this.server)

    if (!this.config?.disableSilvertreeErrorHandling) {
      this.attachErrorHandler(this.server)
    }

    this.config?.configureFastify?.(this.server)

    return this.server
  }

  /**
   * Returns `true` if the server instance is created.
   */
  public isServerCreated() {
    return this.server !== undefined
  }

  /**
   * Returns the server instance.
   */
  public getServer() {
    if (!this.server) {
      this.server = this.createHttpServer()
    }

    return this.server
  }

  /**
   * Returns `true` if the server instance is started.
   */
  public isServerStarted() {
    return this.isStarted
  }

  protected applyFastifyPlugins(server: FastifyInstance) {

    // configure `@fastify/routes` plugin if not disabled
    if (this.config?.plugins?.routes !== false) {
      server.register(fastifyRoutes)
    }

    // configure `@fastify/accepts` plugin if not disabled
    if (this.config?.plugins?.accepts !== false) {
      const options = typeof this.config?.plugins?.accepts === 'boolean' ? undefined : this.config?.plugins?.accepts
      server.register(fastifyAccepts, options)
    }

    // configure `@fastify/formbody` plugin if not disabled
    if (this.config?.plugins?.formBody !== false) {
      const options = typeof this.config?.plugins?.formBody === 'boolean' ? undefined : this.config?.plugins?.formBody
      server.register(fastifyFormBody, options)
    }

    // configure `@fastify/multipart` plugin if not disabled
    if (this.config?.plugins?.multipart !== false) {
      const options = typeof this.config?.plugins?.multipart === 'boolean' ? undefined : this.config?.plugins?.multipart
      server.register(fastifyMultipart, {
        attachFieldsToBody: true,
        limits: {
          fileSize: 10 * 1024 * 1024, // 10 MB
        },
        ...options,
      })
    }

    // configure `@fastify/cors` plugin if not disabled
    if (this.config?.plugins?.cors !== false) {
      const options = typeof this.config?.plugins?.cors === 'boolean' ? undefined : this.config?.plugins?.cors
      server.register(fastifyCors, options)
    }

    // configure `@fastify/cookie` plugin if not disabled
    if (this.config?.plugins?.cookie !== false) {
      const options = typeof this.config?.plugins?.cookie === 'boolean' ? undefined : this.config?.plugins?.cookie
      server.register(fastifyCookie as any, options)
    }
  }

  protected attachErrorHandler(server: FastifyInstance) {
    const show5xxErrors = this.config?.showHttp5xxErrorInResponse ?? process.env.NODE_ENV === 'development'

    server.setErrorHandler((error, request, reply) => {
      const statusCode = error.statusCode ?? 500

      if (statusCode >= 500) {
        this.logger.error(
          error ? error.message : 'Error',
          {
            req: objectPick(request, ['id', 'params', 'query', 'body']),
            err: error,
          },
        )

        const message = show5xxErrors ? error.message : 'Internal Server Error'
        reply.status(statusCode).send({message})
        return
      }

      reply.status(statusCode).send({...error})
    })
  }

  public async startHttpServer() {
    if (this.isStarted) {
      return
    }

    this.isStarted = true

    const server = this.module.provideSync<FastifyInstance>('fastify')
    const routes = this.module.provideSync(HttpRootRegistrarService)

    const scopeEnvPart = (this.config?.scope ?? 'default').toUpperCase()
    const address = process.env[`HTTP_${scopeEnvPart}_ADDRESS`] || process.env.HTTP_ADDRESS || this.config?.address || '0.0.0.0'
    const port = parseInt(process.env[`HTTP_${scopeEnvPart}_PORT`] || process.env.HTTP_PORT || `${this.config?.port ?? '8000'}`)

    await routes.attachPendingComponents()

    await server.listen({
      host: address,
      port: port,
      ...(this.config?.listenOptions ?? {}),
    })
  }

  /**
   * Stops the http server.
   */
  public async stopHttpServer() {
    if (!this.isStarted || !this.server) {
      return
    }

    await this.server.close()
  }

  public getScope() {
    return this.config?.scope ?? 'default'
  }
}
