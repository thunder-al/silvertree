import 'reflect-metadata'
import {expect, test} from 'vitest'
import {CLiArgument, CliCommand} from '../decorators'
import {getCommandHandlerCommandMetadata, getCommandHandlerCommandPropertiesMetadata} from '../metadata'

test('reflect', () => {
  class ReflectClass {

    @CliCommand({name: 'func'})
    public func(
      @CLiArgument({name: 'arg1', position: 0}) arg1: string,
      @CLiArgument({name: 'arg2', position: 1}) arg2: string,
      @CLiArgument({name: 'arg3', position: 2}) arg3: string,
    ) {
    }
  }

  const commands = getCommandHandlerCommandMetadata(ReflectClass)
  expect(commands).length(1)

  const command = commands[0]

  const opts = getCommandHandlerCommandPropertiesMetadata(ReflectClass, command.method)
  expect(opts).length(3)
})
