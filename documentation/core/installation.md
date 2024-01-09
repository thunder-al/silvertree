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
pnpm add reflect-metadata @silvertree/core
```

```shell [npm]
npm install reflect-metadata @silvertree/core
```

:::

## Create basic structure with http server

::: code-group

```ts [start.ts]
import 'reflect-metadata'
import {Container} from '@silvertree/core'
import {AppModule} from './app-module'
import {AppService} from './app-service'

async function start() {
  const c = await Container.make().registerBatch([
    AppModule,
  ])

  // get the service
  const svc = await c.provideAsync(AppService)
  // call secrive's function
  await svc.start()
}

start()
```

```ts [app-module.ts]
import {Module} from '@silvertree/core'
import {AppService} from './app-service'

export class AppModule extends Module {

  async setup() {
    this.bind.singletonClass(AppService)
      .export({global: true})
  }
}
```

```ts [app-service.ts]
export class AppService {

  async index() {
    console.log('Hello world!')
  }
}
```

:::

::: info
Other examples can be found in the [examples](/examples/basic)
:::
