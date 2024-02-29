import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module, wait} from '@silvertree/core'
import {HttpRootModule} from '../HttpRootModule'
import {getFastifyInjectKey, getHttpRootRegistrarInjectKey, getHttpRootServiceInjectKey} from '../util'
import {HttpRootRegistrarService} from '../HttpRootRegistrarService'
import {FastifyInstance, FastifyRequest} from 'fastify'
import {LoggerRootModule} from '@silvertree/logging'
import {HttpModule} from '../HttpModule'
import {HttpControllerSetup, HttpRoute, InjectHttpBody, InjectHttpRequest, InjectHttpServer} from '../metadata'
import {HttpRootService} from '../HttpRootService'

test('http-server-routes', async () => {

  class AppController {

    @HttpControllerSetup()
    async setup(
      @InjectHttpServer() server: FastifyInstance,
    ) {
      server.route({
        method: 'POST',
        url: '/hello-setup',
        handler: async () => {
          return 'response-setup'
        },
      })
    }

    @HttpRoute('GET', '/hello1')
    async hello1() {
      return 'response1'
    }

    @HttpRoute('GET', '/hello/2')
    async hello2() {
      return 'response2'
    }

    @HttpRoute('POST', '/hello3')
    async hello3(
      @InjectHttpRequest() request: FastifyRequest,
    ) {
      return request.body
    }

    @HttpRoute('POST', '/hello4')
    async hello4(
      @InjectHttpBody() body: any,
    ) {
      return body
    }
  }

  class AppMod extends Module {
    async setup() {
      await this.import([
        HttpModule.configured({
          controllers: [
            {controller: AppController},
          ],
        }),
      ])
    }
  }

  const c = await Container.make().registerBatch([
    LoggerRootModule,
    HttpRootModule.configured({
      async configureFastify(server) {
        server.route({
          method: 'GET',
          url: '/hello-root',
          handler: async () => {
            return 'response3'
          },
        })
      },
    }),
    AppMod,
  ])

  const registrarSvc = c.provideSync<HttpRootRegistrarService>(getHttpRootRegistrarInjectKey())
  await registrarSvc.attachPendingComponents()

  const fastify = await c.provideAsync<FastifyInstance>(getFastifyInjectKey())

  expect(await fastify.inject({method: 'GET', url: '/hello1'}))
    .toEqual(expect.objectContaining({statusCode: 200, body: 'response1'}))

  expect(await fastify.inject({method: 'GET', url: '/hello/2'}))
    .toEqual(expect.objectContaining({statusCode: 200, body: 'response2'}))

  expect(await fastify.inject({method: 'POST', url: '/hello3', body: {test: 'body'}}))
    .toSatisfy((res: any) => res.statusCode === 200 && res.body === '{"test":"body"}')

  expect(await fastify.inject({method: 'POST', url: '/hello4', body: {test: 'body2'}}))
    .toSatisfy((res: any) => res.statusCode === 200 && res.body === '{"test":"body2"}')

  expect(await fastify.inject({method: 'POST', url: '/hello-setup'}))
    .toEqual(expect.objectContaining({statusCode: 200, body: 'response-setup'}))

  expect(await fastify.inject({method: 'GET', url: '/hello-root'}))
    .toEqual(expect.objectContaining({statusCode: 200, body: 'response3'}))
})

test('http-server-start', async () => {
  const c = await Container.make().registerBatch([
    LoggerRootModule,
    HttpRootModule.configured({
      port: 0,
      async configureFastify(server) {
        server.route({
          method: 'GET',
          url: '/test',
          handler: async () => {
            return 'test'
          },
        })
      },
    }),
  ])

  const svc = c.provideSync<HttpRootService>(getHttpRootServiceInjectKey())
  await svc.startHttpServer()

  const fastify = await c.provideAsync<FastifyInstance>(getFastifyInjectKey())
  const port = fastify.addresses()[0].port

  const response = await fetch(`http://127.0.0.1:${port}/test`)

  expect(response.status).toEqual(200)
  expect(await response.text()).toEqual('test')

  await wait(50)
  await svc.stopHttpServer()
})
