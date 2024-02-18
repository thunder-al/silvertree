import {Inject} from '@silvertree/core'
import {
  CLI_BASE_COMMAND_INJECT_KEY,
  CLI_COMMANDS_METADATA_KEY,
  CLI_CURRENT_COMMAND_INJECT_KEY,
  CLI_PROPERTIES_METADATA_KEY,
} from './consts'
import {isClassInstance, tapClassMetadata, tapClassPropertyMetadata} from '../../core/src'
import {
  ICliCommandDefinitionConfig,
  ICliCommandDefinitionMetadata,
  ICliCommandPropertyArgumentConfig,
  ICliCommandPropertyArgumentMetadata,
  TCliCommandPropertyMetadata,
} from './types'

export function InjectCliCommand(): ParameterDecorator {
  return Inject(CLI_CURRENT_COMMAND_INJECT_KEY)
}

export function InjectCliBaseCommand(): ParameterDecorator {
  return Inject(CLI_BASE_COMMAND_INJECT_KEY)
}

export function CliCommand(config: ICliCommandDefinitionConfig): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    const meta: ICliCommandDefinitionMetadata = {
      method: propertyKey.toString(),
      name: config.name,
      description: config.description,
      aliases: config.aliases,
    }

    tapClassMetadata(
      target,
      CLI_COMMANDS_METADATA_KEY,
      (current: Array<ICliCommandDefinitionMetadata> = []) => [...current, meta],
    )
  }
}

export function CLiArgument(conf: ICliCommandPropertyArgumentConfig): ParameterDecorator {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    if (!propertyKey) {
      throw new Error('CliArgument decorator can only be used on class method parameters')
    }

    const meta: ICliCommandPropertyArgumentMetadata = {
      type: 'argument',
      index: parameterIndex,
      name: conf.name,
      description: conf.description,
      required: conf.required ?? true,
      default: conf.default,
      parser: conf.parser,
    }

    tapClassPropertyMetadata(
      target,
      CLI_PROPERTIES_METADATA_KEY,
      propertyKey as string,
      (current: Array<TCliCommandPropertyMetadata> = []) => [...current, meta],
    )
  }
}
