import {Container} from '../container'
import {IAsyncFactory, ISyncFactory} from '../factory'
import {TBindKey, TClassConstructor, TConfiguredModuleTerm} from '../types'
import {makeAsyncToSyncProvidingError, ModuleBindingError, ModuleError} from './exceptions'
import {instanceOf} from '../util'
import {DynamicModule} from './DynamicModule'
import {getModuleName} from './util'
import {INJECT_MODULE_CONFIG_METADATA_KEY, INJECT_MODULE_METADATA_KEY} from '../injection'
import {Module} from './Module'

/**
 * This module type made specially as proxy module,
 * its receives a parent module and mirrors its bindings
 * as it was bound/imported in current module.
 *
 * Designed specially for providing module binds/imports
 * to single units with unit-specific data.
 *
 * For example, it can be used to provide http request data
 * and parent module defined services to the controller class
 */
export class FiberModule<PM extends Module = Module> extends Module<void> {
  public static readonly __svt_module_traits = ['fiber']

  constructor(
    container: Container,
    protected readonly parentModule: PM,
  ) {
    super(container)
  }

  public getParentModule(): PM {
    return this.parentModule
  }

  public getSyncFactory<
    T = any,
    F extends ISyncFactory<T> = (ISyncFactory<T, this> | ISyncFactory<T, Module>),
  >(key: TBindKey): [F, Module] {
    if (this.factoriesAsync.has(key) || (this.aliases.has(key) && this.factoriesAsync.has(this.aliases.get(key)!))) {
      throw makeAsyncToSyncProvidingError(this, key)
    }

    // resolve alias only if current key not exists in bindings of current and parent module
    if (!this.factoriesSync.has(key) && (this.aliases.has(key)) || this.parentModule.hasOwnAlias(key)) {
      key = this.aliases.get(key) ?? this.parentModule.getOwnAlias(key)!
    }

    if (this.factoriesSync.has(key)) {
      return [
        this.factoriesSync.get(key) as F,
        this,
      ]
    }

    if (this.parentModule.hasOwnSyncBind(key)) {
      return [
        this.parentModule.getSyncFactory(key)[0] as F,
        this,
      ]
    }

    // search for binding in imported modules
    for (const module of this.getSourceModuleInstances()) {
      // noinspection SuspiciousTypeOfGuard
      if (module instanceof Container) {
        if (module.hasSyncBinding(key)) {
          return module.getSyncModuleFactory<T, Module, F>(key)
        } else {
          continue
        }
      }

      if (module.hasExportedSyncBinding(key)) {
        return module.getSyncFactory(key)
      }
    }

    // fallback to parent module
    return this.parentModule.getSyncFactory(key)
  }

  public getAsyncFactory<
    T = any,
    F extends IAsyncFactory<T, Module> = IAsyncFactory<T, Module>
  >(key: TBindKey): [F, Module] {
    // resolve alias only if current key not exists in bindings of current and parent module
    if (!this.factoriesAsync.has(key) && (this.aliases.has(key)) || this.parentModule.hasOwnAlias(key)) {
      key = this.aliases.get(key) ?? this.parentModule.getOwnAlias(key)!
    }

    if (this.factoriesAsync.has(key)) {
      return [
        this.factoriesAsync.get(key) as F,
        this,
      ]
    }

    if (this.parentModule.hasOwnAsyncBind(key) || this.parentModule.hasOwnAsyncBind(key)) {
      return [
        this.parentModule.getAsyncFactory(key)[0] as F,
        this,
      ]
    }

    // search for binding in imported modules
    for (const module of this.getSourceModuleInstances()) {
      if (module instanceof Container) {
        if (module.hasAsyncBinding(key)) {
          return module.getAsyncModuleFactory<T, Module, F>(key)
        } else {
          continue
        }
      }

      if (module.hasExportedAsyncBinding(key)) {
        return module.getAsyncFactory(key)
      }
    }

    // fallback to sync
    try {
      return this.getSyncFactory(key)
    } catch (_) {
      // ignore
    }

    // fallback to parent module
    return this.parentModule.getAsyncFactory(key)
  }

  async import(
    modules:
      | TClassConstructor<Module>
      | TConfiguredModuleTerm<Module, Container, this, any>
      | Array<TClassConstructor<Module> | TConfiguredModuleTerm<Module, Container, this, any>>,
  ): Promise<void> {
    const modArray = !Array.isArray(modules)
      ? [modules]
      : modules

    if (modArray.some(mod => instanceOf(mod, DynamicModule))) {
      throw new ModuleError(this, `FiberModule ${getModuleName(this)} cannot import DynamicModule`)
    }

    await super.import(modules)
  }

  public export(_: TBindKey | Array<TBindKey>) {
    throw new ModuleError(this, `FiberModule cannot export any bindings`)
  }

  public exportGlobal(_: TBindKey | Array<TBindKey>) {
    throw new ModuleBindingError(this, `FiberModule cannot export global bindings`)
  }

  public hasExportedSyncBinding(_: TBindKey): boolean {
    return false
  }

  public hasExportedAsyncBinding(_: TBindKey): boolean {
    return false
  }

  public getAliasesPointingTo(key: TBindKey): Array<TBindKey> {
    return [
      ...super.getAliasesPointingTo(key),
      ...this.parentModule.getAliasesPointingTo(key),
    ]
  }

  public hasOwnBindOrAlias(key: TBindKey) {
    return super.hasOwnBindOrAlias(key) || this.parentModule.hasOwnBindOrAlias(key)
  }

  public hasOwnBind(key: TBindKey) {
    return super.hasOwnBind(key) || this.parentModule.hasOwnBind(key)
  }

  public hasOwnAlias(key: TBindKey): boolean {
    return super.hasOwnAlias(key) || this.parentModule.hasOwnAlias(key)
  }

  public getModuleConfig<Cfg = PM extends Module<infer Cfg> ? Cfg : any>(): Cfg | undefined {
    return this.parentModule.getModuleConfig()
  }

  protected async setupDefaultBindings() {
    // bind parent module's config
    this.bind.syncFunctional(
      INJECT_MODULE_CONFIG_METADATA_KEY,
      () => this.getModuleConfig(),
      {singleton: false},
    )

    // bind parent module
    this.bind.syncFunctional(
      INJECT_MODULE_METADATA_KEY,
      () => this.parentModule,
      {singleton: false},
    )
      .alias([Module as TBindKey, this.parentModule.constructor as TBindKey])

    // bind current module
    this.bind.syncFunctional(
      FiberModule,
      () => this,
      {singleton: false},
    )
      .alias([this.constructor as TBindKey])
  }
}
