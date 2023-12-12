# Simple http server

This example shows how to create a simple http server.

```ts
import 'reflect-metadata'
import {Container, Inject, Module} from '@silvertree/core'
import {InjectLogger, Logger, LoggerModule, LoggerRootModule} from '@silvertree/logging'
import {HttpControllerSetup, HttpModule, HttpRootModule, HttpRoute, InjectHttpServer} from '@silvertree/http'
import {server} from 'typescript'
import {FastifyInstance} from 'fastify'

// simple service class to demonstrate dependency injection in controller
class AppService {

  getSomeData() {
    return 'Hello World'
  }
}

/*
 controllers like other `this.bind.singletonClass` classes.
 you may not bind them in the module manually,
 it will be done automatically by the `HttpModule`
*/
class AppController {
  @Inject(AppService)
  protected readonly appService!: AppService

  @InjectLogger()
  protected readonly logger!: Logger

  // create a route for GET / using a method decorator
  @HttpRoute('GET', '/', {
    // fastify route options, like schema, preHandler, erc
  })
  async index() {
    this.logger.info('We got a request!')
    return await this.appService.getSomeData()
  }

  /*
   also, you can register routes, plugins, etc.
   manually, by the traditional fastify's way,
   all features of silvertree will work as expected
   */
  @HttpControllerSetup()
  async setupMyServer(
    @InjectHttpServer() server: FastifyInstance,
  ) {
    server.get('/hi', async (req, res) => {
      return 'Hello!'
    })
  }
}

class AppModule extends Module {

  async setup() {

    await this.import([
      LoggerModule,
      HttpModule.configured({
        controllers: [
          /*
           passing here all out controllers.
           they will be constructed only when the http server is started
          */
          {controller: AppController},
        ],
      }),
    ])

    this.bind.singletonClass(AppService)
  }
}

async function start() {
  const c = await Container.make().registerBatch([
    LoggerRootModule,
    HttpRootModule,
    AppModule,
  ])

  /*
   getting a http server manager and start the server.
   this action cause the construction of all controllers
   and its dependent entities
   */
  const svc = await c.provideAsync('http:service:default')
  await svc.startHttpServer()
}

start()
```

You will see the following output:

```log
2023-12-12T10:33:48.011Z (HttpRootModule) info: Server listening at http://0.0.0.0:8000
```

Feel free to open http://localhost:8000 and http://localhost:8000/hi in your browser.
