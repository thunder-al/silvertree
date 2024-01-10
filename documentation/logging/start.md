# Introduction

Logging module provides a simple way to log messages to console file or any other destination utilizing
[winston](https://github.com/winstonjs/winston) library.

This library aims to be a simple wrapper around a winston library and provides a silvertree module integration.

# Installation

::: code-group

```bash [pnpm]
pnpm install @silvertree/logging
```

```bash [npm]
npm install @silvertree/logging
```

```bash [yarn]
yarn add @silvertree/logging
```

:::

# Usage

```ts
import {InjectLogger, Logger} from '@silvertree/logging'

class MyService {
  @InjectLogger()
  protected readonly logger!: Logger

  public foo() {
    this.logger.info('Hello world!', {some: 'data'})
    // will print to console:
    // 2023-12-12T10:16:45.146Z (MyModule) info: Hello world! { some: 'data' }
  }
}
```

```ts
import {Module} from '@silvertree/core'
import {LoggingModule} from '@silvertree/logging'
import {MyService} from './MyService'

export class MyModule extends Module {
  async setup() {
    await this.import([
      LoggingModule, // import LoggingModule
      MyService,
    ])
  }
}
```

```ts
import {Container} from '@silvertree/core'
import {LoggerRootModule} from '@silvertree/logging'
import {MyModule} from './modules/my-module'

async function main() {
  const container = new Container()
  await container.import([
    LoggerRootModule, // import LoggerRootModule
    MyModule,
  ])
}

start()

```
