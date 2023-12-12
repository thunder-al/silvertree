# Logging usage example

Here is an example of using `@silvertree/logging` to log a message to the console.

```ts
import 'reflect-metadata'
import {Container, Module} from '@silvertree/core'
import {InjectLogger, Logger, LoggerModule, LoggerRootModule} from '@silvertree/logging'

class AppModuleA extends Module {
  async setup() {
    await this.import([
      /*
       importing this logging (not root logging) module
       will create a sub-logger with `AppModuleA` mark
       in each log line produced by it.
       */
      LoggerModule,
    ])

    this.bind.singletonClass(AppServiceA)
      .export({global: true})
  }
}

class AppServiceA {
  /*
   injecting logger into the service.
   you need to have `LoggerModule` in module imports
   to be able to inject a logger into your service classes (entities).
   
   warning:
   this class field will be only after class constructor will be called.
   if you want to use logger in the constructor, you should use
   `@InjectLogger()` decorator on the constructor parameter.
   */
  @InjectLogger()
  protected readonly logger!: Logger

  public foo() {
    this.logger.info('foo', {some: 'data', here: [1, 2, 3, 4]})
    this.logger.error('oh no!')
  }
}


// another module with another service for demonstration purposes.
class AppModuleB extends Module {
  async setup() {
    await this.import([
      LoggerModule,
    ])

    this.bind.singletonClass(AppServiceB)
      .export({global: true})
  }
}

class AppServiceB {
  @InjectLogger()
  protected readonly logger!: Logger

  public bar() {
    this.logger.info('bar', {some: {data: 'here'}})
    this.logger.warn('somthing suspicious is going on here')
  }
}

async function start() {
  const c = await Container.make().registerBatch([
    /*
     this is a root logging module.
     
     it will create an instance of a logger and
     export it to the global scope to further usage
     in `LoggerModule` providing logic.
     */
    LoggerRootModule,

    // importing modules with services.
    AppModuleA,
    AppModuleB,
  ])

  const svcA = await c.provideAsync(AppServiceA)
  svcA.foo()

  const svcB = await c.provideAsync(AppServiceB)
  svcB.bar()
}

start()
```

Console output will be

```txt
2023-12-12T10:16:45.146Z (AppModuleA) info: foo { some: 'data', here: [ 1, 2, 3, 4 ] }
2023-12-12T10:16:45.148Z (AppModuleA) error: oh no!
2023-12-12T10:16:45.149Z (AppModuleB) info: bar { some: { data: 'here' } }
2023-12-12T10:16:45.149Z (AppModuleB) warn: somthing suspicious is going on here
```
