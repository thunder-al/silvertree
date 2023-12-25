# Core Concepts

## Introduction

Silvertree is a general purpose IoC, DI library to help you build modular, testable and maintainable applications.
It is a set of libraries that utilizes already existed libraries or implementing some specific features.

The whole point of this library is to provide a simple, extendable, testable and robust way to build applications by
invoking/creating and booting services/entities only when they are needed. It allows you to build a hybrid
monolithic/microservice application architecture with ease.

## Features

* No magic — everything is explicit: no "magic" string or behavior
* Modular — you can split your application into modules, which can be imported into other modules
* Testable — you can test your application, providing mocks for any service
* Minimal boilerplate — no need to write a lot of code to get things done
* Extendable — you can extend any part of the library (even internal DI mechanism and vendor modules)
* Dependency Injection — inject dependencies into any type of entities utilizing custom factories
* Selective booting — create only what you need
* Incremental booting — boot services, using content from other services
* Async booting — async and sync factories are separated for better performance
* TypeScript first — written in TypeScript, with full type support, but can be used with plain JavaScript.
  Also, has support for mjs out of the box.
* Toolchain agnostic — you can use any toolchain you want. It can work with bundlers (webpack, rollup/vite, parcel, tsc,
  etc.), with or without mangle/obfuscation, or without them at all.
* Platform-agnostic — you can use silvertree packages (which is not specially made for backend, like http)
  in your frontend app.

## Architecture

### Container

Its base application registry that holds all regular modules and global bindings.
Only one instance of container can be created per application.

### Module

Module is a primary architectural unit of the application.  
It provides factories with a special binding key which can resolve and produce any
type of entities (user-defined services).  
It can export binding to another module, which imports it.

There are three types of modules:

#### Regular Module (Module)

This type of module is used to define primary application logic.
Instance (as well as setup) of it is creating only one time per application.
Can import other modules and export global and local bindings.

#### Dynamic Module (DynamicModule)

This type of module is creating and booting every time when it's imported.
Used to define entities, that will be unique for each module's import.

For example, this module can create multiple connections do different databases, filesystems,
providing module-scoped entities (like logger, which show an importer module name in log entries)
or providing defining data references (registering http controllers, event consumers, etc.).

#### Fiber Module (FiberModule)

This is a lightweight and garbage collector safe module type that can be used to proxy existed module bindings.
It Can be used to provide dependencies for some unitary jobs, like handling http request, event or queue message.

### Binding Key

Binding key is a key for a factory that can produce some entity. It can be a string, a symbol
or a class/constructor (basically a function).

### Factory

Factory is a class, which produces entities according to options, inject stack, etc.
Factory can utilize a singleton pattern or work as a regular factory.

There is different types of factories: regular (just a function),
class (includes constructor a property DI mechanism) and custom (you can make your own factory).

Factories, as well as bind/provide methods, are separated to sync and async variant.
If your entity and its dependencies do not require async initialisation, you should use sync variant
to speed up an initialization process.

### Entity

Entity is user defined result of factory invocation, it can be anything:
a class instance, a function, a string/int/boolean, etc.
