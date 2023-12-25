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
