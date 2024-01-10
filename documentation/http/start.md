# Introduction

The `@silvertree/http` module provides a http server implementation based on [fastify](https://fastify.dev/)
for silvertree applications.

This package creates fastify http server with some essential plugins
and provides a service to manage the server:formBody

* `@fastiry/multipart` for handling multipart form data
* `@fastiry/accepts` a set of functions to parse and send HTTP Accept-* headers
* `@fastiry/cookie` parsing and sending http cookies
* `@fastiry/cors` for handling cross-origin resource sharing (CORS)
* `@fastiry/routes` simple plugin which stores all registered

All this plugin is configured with default values, but can be overwritten or disabled.

# Installation

::: code-group

```shell [pnpm]
pnpm add @silvertree/http
```

```shell [npm]
npm install @silvertree/http
```

```shell [yarn]
yarn add @silvertree/http
```

:::

# Usage

::: code-group

```ts [start.ts]
import 'reflect-metadata'
import {Container} from '@silvertree/core'
import {LoggerRootModule} from '@silvertree/logging'
import {HttpRootModule, getHttpRootServiceInjectKey} from '@silvertree/http'
import {AppModule} from './app-module'

async function start() {
  const c = await Container.make().registerBatch([
    LoggerRootModule,
    HttpRootModule,
    AppModule,
  ])

  // get the http server manager directly
  const svc = await c.provideAsync(getHttpRootServiceInjectKey())
  // start the server
  await svc.startHttpServer()
}

start()
```

```ts [app-module.ts]
import {Module} from '@silvertree/core'
import {LoggerModule} from '@silvertree/logging'
import {HttpModule} from '@silvertree/http'
import {AppController} from './app-controller'

export class AppModule extends Module {

  async setup() {

    await this.import([
      // getting module scoped logger
      LoggerModule,
      // registering http controller
      HttpModule.configured({
        controllers: [
          {controller: AppController},
        ],
      }),

    ])
  }
}
```

```ts [app-controller.ts]
import {Inject} from '@silvertree/core'
import {InjectLogger, Logger} from '@silvertree/logging'
import {HttpRoute} from '@silvertree/http'

export class AppController {

  @InjectLogger()
  protected readonly logger!: Logger

  @HttpRoute('GET', '/')
  async index() {
    this.logger.info('Hello world!')
    return 'Hello world!'
  }
}
```

:::

::: info
Other examples can be found in the [examples](/examples/basic)
:::
