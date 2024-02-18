import {getClassMetadata, getPropertyMetadata} from '../../core/src'
import {ICliCommandDefinitionMetadata, TCliCommandPropertyMetadata} from './types'
import {CLI_COMMANDS_METADATA_KEY, CLI_PROPERTIES_METADATA_KEY} from './consts'

export function getCommandHandlerCommandMetadata(target: Object): Array<ICliCommandDefinitionMetadata> {
  return getClassMetadata(target, CLI_COMMANDS_METADATA_KEY, false) ?? []
}

export function getCommandHandlerCommandPropertiesMetadata(target: Object, key: string): Array<TCliCommandPropertyMetadata> {
  return getPropertyMetadata(target, key, CLI_PROPERTIES_METADATA_KEY) ?? []
}
