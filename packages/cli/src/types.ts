import {Module, TBindKey, TBindKeyRef} from '@silvertree/core'
import type {Argument, Option} from 'commander'

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

export interface ICliCommandConfig {
  /**
   * Command name. Will be used in cli to call this command and in the help message.
   */
  name: string
  /**
   * Command description. Will be used in the help message.
   */
  description?: string
  /**
   * Command aliases. Will be used in the help message.
   */
  aliases?: Array<string>
  /**
   * Command arguments. Will be used in the help message.
   */
  arguments?: Array<Argument>
  /**
   * Command options. Will be used in the help message.
   */
  options?: Array<Option>
  /**
   * Command action as plain function or as ref to module service. Will be called when the command is executed.
   */
  action?:
    | ((...args: any[]) => void | Promise<void>)
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
  /**
   * Command aliases. Will be used in the help message.
   */
  aliases?: Array<string>
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
  /**
   * Command aliases. Will be used in the help message.
   */
  aliases?: Array<string>
}

export type TCliCommandPropertyMetadata = ICliCommandPropertyArgumentMetadata

export interface ICliCommandPropertyArgumentMetadata {
  type: 'argument'
  index: number
  name: string
  description?: string
  required: boolean
  default?: any
  parser?: (value: string) => any
}

export interface ICliCommandPropertyArgumentConfig {
  /**
   * Argument name.
   */
  name: string
  /**
   * Argument description.
   */
  description?: string
  /**
   * Argument aliases.
   * @default true
   */
  required?: boolean
  /**
   * Argument default value.
   */
  default?: any
  /**
   * Argument value parser.
   */
  parser?: (value: string) => any
}
