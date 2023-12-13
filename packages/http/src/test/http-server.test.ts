import 'reflect-metadata'
import {expect, test} from 'vitest'
import {Container, Module, wait} from '@silvertree/core'
import {HttpRootModule} from '../http-root-module'
import {getFastifyInjectKey, getHttpRootRegistrarInjectKey, getHttpRootServiceInjectKey} from '../util'
import {HttpRootRegistrarService} from '../http-root-registrar-service'
import {FastifyInstance} from 'fastify'
import {LoggerRootModule} from '@silvertree/logging'
import {HttpModule} from '../http-module'
import {HttpControllerSetup, HttpRoute, InjectHttpServer} from '../metadata'
import {HttpRootService} from '../http-root-service'

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

  await wait(50)
  await svc.stopHttpServer()
})