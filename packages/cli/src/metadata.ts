import {getClassMetadata} from '@silvertree/core'
import {ICliCommandDefinitionMetadata, TCliCommandPropertyMetadata} from './types'
import {CLI_COMMANDS_METADATA_KEY, CLI_PROPERTIES_METADATA_KEY} from './consts'

export function getCommandHandlerCommandMetadata(target: Object): Array<ICliCommandDefinitionMetadata> {
  return getClassMetadata(target, CLI_COMMANDS_METADATA_KEY, false) ?? []
}

export function getCommandHandlerCommandPropertiesMetadata(target: Object, key: string): Array<TCliCommandPropertyMetadata> {
  const props: Array<TCliCommandPropertyMetadata> = getClassMetadata(target, CLI_PROPERTIES_METADATA_KEY) ?? []
  return props.filter(el => el.method === key)
}
