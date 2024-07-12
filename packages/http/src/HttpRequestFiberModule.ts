import {FiberModule, objectOmit} from '@silvertree/core'
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import {
  HTTP_FASTIFY_REPLY_INJECT_KEY,
  HTTP_FASTIFY_REQUEST_EXTRACT_INJECT_KEY,
  HTTP_FASTIFY_REQUEST_INJECT_KEY,
  HTTP_LOCAL_FASTIFY_INJECT_KEY,
} from './const'

export class HttpRequestFiberModule extends FiberModule {

  public bindFastify(server: FastifyInstance) {
    this.bind.syncFunctional(
      HTTP_LOCAL_FASTIFY_INJECT_KEY,
      () => server,
    )
  }

  public bindRequestPayload(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    this.bind.constant(
      HTTP_FASTIFY_REQUEST_INJECT_KEY,
      request,
    )

    // TODO: fastidy reply has `then` method, which stops injection cycle until request ends
    this.bind.constant(
      HTTP_FASTIFY_REPLY_INJECT_KEY,
      () => reply,
    )
  }

  protected async setupDefaultBindings() {
    await super.setupDefaultBindings()

    this.bind.syncFunctional(
      HTTP_FASTIFY_REQUEST_EXTRACT_INJECT_KEY,
      (module, options) => {
        if (!options || !options.extractor) {
          throw new Error('HttpRequestFiberModule: options.extractor is required')
        }

        const request = module.provideSync(HTTP_FASTIFY_REQUEST_INJECT_KEY)

        return options.extractor(request)
      },
    )
  }
}
