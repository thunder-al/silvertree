# Container

## Introduction

Container is an entry point of your application.  
It holds all of your application's regular modules and resolves global bindings.

After creating a container and registering modules in it, it will create instances
of all modules and call their `setup` methods and resolve module imports in it.
This action will not trigger any entity factories (depends on usage).

## Creating a container

Container is a basic class, so you can create it by calling `new Container()`, but for convenience, you can use
`Container.make()` (its same as creating container with `new` keyword), which will be better for chain calls.

After creating a container, you need to register modules in it by calling `register/registerBatch` method and provide an
array
of modules.
This is an async method, so you can use `await` keyword before it or use promise's `then` method.

::: code-group

```ts [async/await]
// async/await without root promise support (recommended)
async function start() {
  const c = await Container.make().registerBatch([
    AppModule,
  ])

  // ...
}

start()
```

```ts [async/await root]
// async/await with root promise support (mjs)
const c = await Container.make().registerBatch([
  AppModule,
])

// ...
```

```ts [async/await iife]
// async/await with self invoking function
;(async () => {
  const c = await Container.make().registerBatch([
    AppModule,
  ])

  // ...
})()
```

```ts [promise then]
// pure promise then
Container.make()
  .registerBatch([AppModule])
  .then(c => {
    // ...
  })
```

:::

## Using a container

After creating a container and registering modules in it, you can use it to
provide global bindings and module imports and get module instances.

```ts
async function start() {
  const c = await Container.make().registerBatch([
    AppModule,
  ])

  const module = c.getModule(AppModule) // get module instance
  const svc = await c.provideAsync(AppService) // get service instance
}

start()
```
