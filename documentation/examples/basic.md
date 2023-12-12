# Minimal example

Small as possible working setup for a basic hello world app.

```ts
import 'reflect-metadata'
import {Container, Module} from '@silvertree/core'

// creating a module
class AppModule extends Module {

  async setup() {
    // setup method called one time when the module is registered.
    // so, print something to the console.
    console.log('Hello world')
  }
}

// initialization cycle of the whole app is async.
// only esm modules supports top level await.
// this variant will work with both esm and cjs.
async function start() {
  // create a container and register a module.
  // module's `setup` method will be called and awaited.
  const c = await Container.make().registerBatch([
    AppModule,
  ])
}

// start a thing!
start()
```

# Basic example

A bit more complex example with a module that has a service.

```ts
import 'reflect-metadata'
import {Container, Module} from '@silvertree/core'

// creating a module.
class AppModule extends Module {

  async setup() {
    /*
     `this.bind` is a helper binding manager
     to create and bind factories to the module.
     
     here we are binding a singleton class factory
     and exporting it to the global to be able
     to access it outside the module.
     */
    this.bind.singletonClass(AppService)
      .export({global: true})
  }
}


/*
 creating a service class.

 constructor of this class will be consumed by a singleton class factory
 this factory will produce an entity (instance of this class) only when
 it will be requested and will store it for later usage (singleton).
*/
class AppService {

  // just regular method with user specific name and logic.
  async hello() {
    console.log('Hello world')
  }
}

async function start() {
  const c = await Container.make().registerBatch([
    AppModule,
  ])

  /*
   because we exported the factory to the global
   we can access it right from container provide call.

   we using `provideAsync` because the factory is async
   you can use `syncSingletonClass` instread of `singletonClass`.
   in this you can use `c.provideSync(AppService)` and get rid of await.
   */
  const svc = await c.provideAsync(AppService)

  // and call the method, nothing special from here.
  svc.hello() // $> Hello world
}

start()
```
