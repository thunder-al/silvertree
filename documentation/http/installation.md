# Installation

## Create a new project

::: code-group

```shell [pnpm]
pnpm init
```

```shell [npm]
npm init
```

:::

Or use an existing project

## Install package

::: code-group

```shell [pnpm]
pnpm add reflect-metadata @silvertree/core @silvertree/logging @silvertree/http
```

```shell [npm]
npm install reflect-metadata @silvertree/core @silvertree/logging @silvertree/http
```

:::

## Create basic structure with http server

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
