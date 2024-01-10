# Creating A New Module

## Introduction

Modules are the building blocks of your application.
They are the containers for all of your application's logic.
Modules are also the place where you define your application's architecture.

Each module (except dynamic and fiber modules) will be created once per container
initialization and will be stored in it.

Every module should achieve one singular goal and covered with tests.  
For example, payment module should cover all payment-related logic and should not contain user creation or other
non-payment related actions.

Module can export entities by one or more keys, so other modules are able to import it.  
For example, payment module can import user module and use it to update user's balance.

<mermaid>
<pre>
stateDiagram-v2
    direction LR
    state UserModule {
        UserService
    }
    state PaymentModule {
        PaymentHandlerService
    }
    [*] --> PaymentHandlerService: payment confirmation
    PaymentHandlerService --> UserService: update user balance
</pre>
</mermaid>

Here is general module structure:

<mermaid>
<pre>
stateDiagram-v2
    direction TB
    state SomeModule {
        FooService
        BarService
        BazService
        [*] --> FooService: using vendor entity
        FooService --> BarService: using local entity as dependency
        BazService --> BarService: using local entity
    }
    [*] --> SomeModule: importing other's module
    BarService --> [*]: exporting bar service for other modules
</pre>
</mermaid>

## Creating a module

* To create a new module, first of all, you need to come up with the name of the module.
  It should be short and describe the purpose of the module.
* Then, you need to create a new file `<ModuleName>Module.ts` in `src/modules/<module-name>` directory.
* Create some entities, for example, class-service `<ServiceName>Service.ts` in the same directory.
* In `setup` method of the module, you need to bind your entities.  
  For example, `this.bind.singletonClass(FooService)` will bind `FooService` as a singleton class.
  If you will use this service in other modules, you need to export it by calling `export()` method.
* To be able to import module and use its service typings, you need to export it from `src/modules/index.ts`
  file as regular es exports.

The Final result should look like this:

::: code-group

```ts [index.ts]
// src/modules/my-module/index.ts
export {MyModule} from './MyModule'
export {MyService} from './MyService'
```

```ts [MyModule.ts]
// src/modules/my-module/MyModule.ts
import {Module} from '@silvertree/core'
import {MyService} from './MyService'

export class MyModule extends Module {
  async setup() {
    this.bind.singletonClass(MyService) // define MyService binding
      .export() // and export it for other modules
  }
}
```

```ts [MyService.ts]
// src/modules/my-module/MyService.ts
export class MyService {
  public someMethod() {
    return 'Hello world!'
  }
}
```

:::

## Using a module

After that, you can import your module and use its service in other modules:

```ts
// src/modules/other-module/OtherModule.ts
import {Module} from '@silvertree/core'
import {MyModule} from '../my-module'

export class OtherModule extends Module {
  async setup() {
    await this.import([MyModule]) // import MyModule
  }
}
```

All services inside `OtherModule` will be able to import and use `MyService`

::: code-group

```ts [OtherFooService.ts]
// src/modules/other-module/OtherFooService.ts
import {Inject} from '@silvertree/core'
import {MyService} from '../my-module'

export class OtherFooService {
  @Inject(MyService)
  protected readonly myService!: MyService

  public foo() {
    const data = this.myService.someMethod()
    console.log(data) // ==> 'Hello world!'
  }
}
```

```ts [OtherBarService.ts]
// src/modules/other-module/OtherBarService.ts
import {Inject} from '@silvertree/core'
import {MyService} from '../my-module'

export class OtherBarService {
  @Inject(MyService)
  protected readonly myService!: MyService

  public bar() {
    const data = this.myService.someMethod()
    console.log(data) // ==> 'Hello world!'
  }
}
```

:::

And they all will have the same instance of `MyService` (`barService.myService === fooService.myService`)

## Module configuration

You can pass configuration to the module by calling `configureModule(moduleClass, configObj)` while you
registering it in the container.
Module and `configureModule` supports type-checking, so you will get an error if you will try to pass
wrong configuration.

```ts
interface IMyModuleConfig {
  foo: string
  bar: number
}

export class MyModule extends Module<IMyModuleConfig> {
  async setup() {
    this.config.foo // ==> 'foo'
    // ...
  }
}

const container = Container.make().register([
  configureModule(MyModule, {foo: 'foo', bar: 123}),
])
```

For convenience, every configurable module has `configured` method, which will you should use instead of
calling `configureModule` directly.

```ts
const container = Container.make().register([
  HttpRootModule.configured({
    // ...
  })
])
```

::: warning
If you will try to register/import regular module with different configuration,
only the first passed configuration will be used.
:::
