import {
  CLI_COMMAND_CONFIG_INJECT_KEY,
  CLI_COMMAND_PARAMETER_INJECT_KEY,
  CLI_COMMANDS_METADATA_KEY,
  CLI_PROPERTIES_METADATA_KEY,
} from './consts'
import {
  decorateInjectArgument,
  Inject,
  isClassInstance,
  tapClassMetadata,
  tapClassPropertyMetadata,
} from '@silvertree/core'
import {
  ICliCommandArgumentConfig,
  ICliCommandDefinitionConfig,
  ICliCommandDefinitionMetadata,
  ICliCommandOptionConfig,
  ICliCommandPropertyArgumentMetadata,
  ICliCommandPropertyOptionMetadata,
  TCliCommandPropertyMetadata,
} from './types'

export function InjectCliCommand(): ParameterDecorator {
  return Inject(CLI_COMMAND_CONFIG_INJECT_KEY)
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
    }

    tapClassMetadata(
      target,
      CLI_COMMANDS_METADATA_KEY,
      (current: Array<ICliCommandDefinitionMetadata> = []) => [...current, meta],
    )
  }
}

export function CLiArgument(conf: ICliCommandArgumentConfig): ParameterDecorator {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {

    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    const meta: ICliCommandPropertyArgumentMetadata = {
      type: 'argument',
      position: conf.position,
      method: propertyKey as string,
      index: parameterIndex,
      name: conf.name,
      description: conf.description,
      required: conf.required ?? conf.default === undefined, // not required if default is set
      default: conf.default,
      parser: conf.parser,
    }

    tapClassMetadata(
      target,
      CLI_PROPERTIES_METADATA_KEY,
      (current: Array<TCliCommandPropertyMetadata> = []) => [...current, meta],
    )

    // handle argument injection via fiber module
    decorateInjectArgument(
      target,
      propertyKey,
      parameterIndex,
      CLI_COMMAND_PARAMETER_INJECT_KEY,
      {meta},
    )
  }
}

export function CLiOption(conf: ICliCommandOptionConfig): ParameterDecorator {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {

    // property decorator returns an object with class constructor instead of just constructor
    if (isClassInstance(target)) {
      target = target.constructor
    }

    const meta: ICliCommandPropertyOptionMetadata = {
      type: 'option',
      method: propertyKey as string,
      name: conf.name,
      shortName: conf.shortName,
      description: conf.description,
      required: conf.required ?? false, // all options are not required by default
      default: conf.default,
      parser: conf.parser,
    }

    tapClassMetadata(
      target,
      CLI_PROPERTIES_METADATA_KEY,
      (current: Array<TCliCommandPropertyMetadata> = []) => [...current, meta],
    )

    // handle option injection via fiber module
    decorateInjectArgument(
      target,
      propertyKey,
      parameterIndex,
      CLI_COMMAND_PARAMETER_INJECT_KEY,
      {meta},
    )
  }
}
