import {Container, Module, TBindKey, TBindKeyRef} from '@silvertree/core'

/**
 * Command line argument parser result.
 */
export interface ICliArgv {
  options: Record<string, string | number | boolean>
  optionsShort: Record<string, string | number | boolean>
  args: Array<string | number | boolean>
}

export interface ICliRootModuleConfig {
  /**
   * The scope of the root module. This is used to create a unique key for the root module's service.
   */
  scope?: string
  /**
   * App execution name. Will be used in the help message.
   */
  appName?: string
  /**
   * If true, the app will exit after the command promise is resolved.
   * @default false
   */
  closeOnCommandPromiseResolved?: boolean
}

export interface ICliModuleConfig {
  /**
   * The scope of the root module. This is used to create a unique key for the root module's service.
   */
  scope?: string
  /**
   * The name of the module. Will be used in the help message.
   */
  handlers?: Array<TBindKey | TBindKeyRef>
}

/**
 * Command argument definition config.
 */
export interface ICliCommandArgumentConfig {
  /**
   * Argument name.
   */
  name: string
  /**
   * Argument position in the command. Will be used during the command parsing.
   * Starts from 0.
   */
  position: number
  /**
   * Argument description.
   */
  description?: string
  /**
   * Is argument required.
   */
  required?: boolean
  /**
   * Argument default value factory function.
   */
  default?: () => any
  /**
   * Optional argument value parser.
   */
  parser?: (value: string) => any
}

/**
 * Command option definition config.
 */
export interface ICliCommandOptionConfig {
  /**
   * Option name. Will be used during the command parsing as `--name`.
   */
  name: string
  /**
   * Option short name. Will be used during the command parsing as `-n`.
   */
  shortName?: string
  /**
   * Option description. Will be used in the help message.
   */
  description?: string
  /**
   * Is option required.
   */
  required?: boolean
  /**
   * Option default value factory function.
   */
  default?: () => any
  /**
   * Optional option value parser.
   */
  parser?: (value: string) => any
}

export interface ICliCommandConfig {
  /**
   * Command name. Will be used in cli to call this command and in the help message.
   */
  name: string
  /**
   * Command description. Will be used in the help message.
   */
  description: string | null
  /**
   * Command arguments. Will be used in the help message.
   */
  arguments: Array<ICliCommandArgumentConfig>
  /**
   * Command options. Will be used in the help message.
   */
  options: Array<ICliCommandOptionConfig>
  /**
   * Command action as plain function or as ref to module service. Will be called when the command is executed.
   */
  action:
    | ((container: Container, args: ICliArgv) => void | Promise<void>)
    | { module: Module, binding: TBindKey | TBindKeyRef, method: string }
}

/**
 * Command definition config.
 */
export interface ICliCommandDefinitionConfig {
  /**
   * Command name. Will be used in cli to call this command and in the help message.
   */
  name: string
  /**
   * Command description. Will be used in the help message.
   */
  description?: string
}

/**
 * Command definition metadata.
 */
export interface ICliCommandDefinitionMetadata {
  /**
   * Class method name. Will be called when the command is executed.
   */
  method: string
  /**
   * Command name. Will be used in cli to call this command and in the help message.
   */
  name: string
  /**
   * Command description. Will be used in the help message.
   */
  description?: string
}

export type TCliCommandPropertyMetadata = ICliCommandPropertyArgumentMetadata | ICliCommandPropertyOptionMetadata

export interface ICliCommandPropertyArgumentMetadata extends ICliCommandArgumentConfig {
  type: 'argument'
  index: number
  method: string
}

export interface ICliCommandPropertyOptionMetadata extends ICliCommandOptionConfig {
  type: 'option'
  method: string
}

