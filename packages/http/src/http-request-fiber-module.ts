import {FiberModule} from '@silvertree/core'
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify'
import {HTTP_FASTIFY_REPLY_INJECT_KEY, HTTP_FASTIFY_REQUEST_INJECT_KEY, HTTP_LOCAL_FASTIFY_INJECT_KEY} from './const'

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
    this.bind.syncFunctional(
      HTTP_FASTIFY_REQUEST_INJECT_KEY,
      () => request,
    )

    this.bind.syncFunctional(
      HTTP_FASTIFY_REPLY_INJECT_KEY,
      () => reply,
    )
  }
}
