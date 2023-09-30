import {TClassConstructor} from '../types'
import {AsyncFactory, Factory} from '../factory/Factory'
import {assertContainerImporterNoLoop, assertOwnBinding, getContainerName} from './util'
import {TContainerKey} from './types'
import {TFactoryMetadata} from '../factory/types'
import {isClassInstance} from '../util'
import {ContainerImportError, makeNoBindingError} from './exceptions'

export class Container<SetupArgs extends Array<unknown> = Array<any>> {

  protected factories = new Map<TContainerKey, Factory<any>>()
  protected factoriesAsync = new Map<TContainerKey, AsyncFactory<any>>()
  protected aliases = new Map<TContainerKey, TContainerKey>()

  protected exports: Set<TContainerKey> = new Set()

  protected importedContainers: Set<Container> = new Set()

  protected parentImportContainer: Container | null = null

  public init() {
    this.setup.apply(this, [] as any)
  }

  public setup(...setupArgs: SetupArgs) {
    // here should be all binds
  }

  public bind<T, F extends Factory<T>>(key: TContainerKey, factory: F) {
    this.factories.set(key, factory)

    return factory.makeBindContext(this, key)
  }

  public bindAsync<T>(key: TContainerKey, factory: AsyncFactory<T>) {
    this.factoriesAsync.set(key, factory)

    return factory.makeBindContext(this, key)
  }

  public getFactory<
    T = any,
    F extends Factory<T, TFactoryMetadata, this> = Factory<T, TFactoryMetadata, this>
  >(key: TContainerKey) {

    // resolve alias only if current key not exists in bindings
    if (!this.factories.has(key) && this.aliases.has(key)) {
      key = this.aliases.get(key)!
    }

    if (!this.factories.has(key)) {
      throw makeNoBindingError(this, key)
    }

    return this.factories.get(key) as F
  }

  public provide<T>(key: TContainerKey) {
    const factory = this.getFactory(key)

    return factory.get(this) as T
  }

  public hasOwnBindOrAlias(key: TContainerKey) {
    return this.factories.has(key) || this.factoriesAsync.has(key)
  }

  public hasOwnBind(key: TContainerKey) {
    return this.factories.has(key) || this.factoriesAsync.has(key) || this.aliases.has(key)
  }

  public export(key: TContainerKey) {
    this.exports.add(key)
  }

  public alias(key: TContainerKey, aliasKey: TContainerKey) {
    assertOwnBinding(this, key)
    this.aliases.set(aliasKey, key)
  }

  public isRootContainer() {
    return this.parentImportContainer === null
  }

  public setImporterContainer(container: Container) {
    assertContainerImporterNoLoop(this, container)
    this.parentImportContainer = container
    return this
  }

  public getImporterContainer() {
    return this.parentImportContainer
  }

  public import<Args extends Array<any>, C extends Container<Args>>(container: TClassConstructor<C> | C) {
    if (isClassInstance(container)) {
      if (!container.isRootContainer()) {
        throw new ContainerImportError(
          this,
          container,
          `Cannot import ${getContainerName(container)} to ${getContainerName(this)} because it has been already imported by ${getContainerName(container.getImporterContainer()!)}. Use container classes instead of their instances.`,
        )
      }

      container.setImporterContainer(this)
      this.importedContainers.add(container)
      return
    }

    const instance = new container()
    instance.setImporterContainer(this)
    this.importedContainers.add(instance)
    instance.init()
  }

  public getImports() {
    return this.importedContainers
  }

  public getImportedContainer<C extends Container>(cls: TClassConstructor<C>) {
    for (const c of this.importedContainers) {
      if (c instanceof cls) {
        return c
      }
    }

    throw new Error(`Container ${getContainerName(this)} dont have direct import of ${getContainerName(cls)}`)
  }

  public removeContainerImport<C extends Container>(container: C) {
    if (!this.importedContainers.has(container)) {
      throw new Error(`Container ${getContainerName(this)} dont have direct import of ${getContainerName(container)}`)
    }

    this.importedContainers.delete(container)
  }

  public destroy() {
    for (const imp of this.getImports()) {
      imp.destroy()
    }

    const importer = this.getImporterContainer()

    if (importer) {
      importer.removeContainerImport(this)
    }

    this.parentImportContainer = null
  }
}


