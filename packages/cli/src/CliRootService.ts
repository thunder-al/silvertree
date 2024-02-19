import {Inject, InjectModuleConfig, Module, TBindKey} from '@silvertree/core'
import {
  ICliCommandArgumentConfig,
  ICliCommandConfig,
  ICliCommandOptionConfig,
  ICliCommandPropertyArgumentMetadata,
  ICliCommandPropertyOptionMetadata,
  ICliRootModuleConfig,
} from './types'
import {CliRunnerService} from './CliRunnerService'
import {getCommandHandlerCommandMetadata, getCommandHandlerCommandPropertiesMetadata} from './metadata'

export class CliRootService {

  @InjectModuleConfig()
  protected readonly config!: ICliRootModuleConfig

  @Inject(CliRunnerService)
  protected readonly runner!: CliRunnerService

  protected readonly commandsDefinitions: Map<string, ICliCommandConfig> = new Map()

  constructor() {
    this.addHelpCommand()
  }

  public registerCommand(command: ICliCommandConfig) {
    this.commandsDefinitions.set(command.name, command)
  }

  public removeCommand(commandName: string | ICliCommandConfig) {
    commandName = typeof commandName === 'string' ? commandName : commandName.name
    this.commandsDefinitions.delete(commandName)
  }

  public registerCommandsFromHandler(
    module: Module,
    handlerKey: TBindKey,
  ) {
    const commandConfigs = getCommandHandlerCommandMetadata(handlerKey)

    for (const cmdConf of commandConfigs) {
      const command: ICliCommandConfig = {
        name: cmdConf.name,
        description: cmdConf.description ?? null,
        arguments: [],
        options: [],
        action: {
          module,
          binding: handlerKey,
          method: cmdConf.method as string,
        },
      }

      const props = getCommandHandlerCommandPropertiesMetadata(handlerKey, cmdConf.method)

      const args = props.filter(p => p.type === 'argument') as Array<ICliCommandPropertyArgumentMetadata>

      for (const argMeta of args.sort((a, b) => a.index - b.index)) {
        const arg: ICliCommandArgumentConfig = {
          name: argMeta.name,
          position: argMeta.position,
          description: argMeta.description,
          required: argMeta.required ?? argMeta.default === undefined, // not required if default is set
          parser: argMeta.parser,
          default: argMeta.default,
        }
        command.arguments.push(arg)
      }

      const options = props.filter(p => p.type === 'option') as Array<ICliCommandPropertyOptionMetadata>

      for (const optMeta of options) {
        const opt: ICliCommandOptionConfig = {
          name: optMeta.name,
          shortName: optMeta.shortName,
          description: optMeta.description,
          required: optMeta.required ?? optMeta.default === undefined, // not required if default is set
          parser: optMeta.parser,
          default: optMeta.default,
        }
        command.options.push(opt)
      }

      this.registerCommand(command)
    }
  }

  public removeAllCommandsFromHandler(
    module: Module,
    handlerKey: TBindKey,
  ) {
    const commandConfigs = getCommandHandlerCommandMetadata(handlerKey)

    for (const cmdConf of commandConfigs) {
      this.removeCommand(cmdConf.name)
    }
  }

  public printHelp() {
    const commandPadding = 15
    const commandNames = Array.from(this.commandsDefinitions.keys()).sort()
    const commands = commandNames.map(name => this.commandsDefinitions.get(name)!)

    console.log('Usage: <command> [options] [arguments]')
    console.log('Commands:')
    console.log()


    for (const command of commands) {
      console.log(`${command.name.padEnd(commandPadding)} ${command.description ?? ''}`)

      const args = command.arguments.sort((a, b) => a.position - b.position)
      for (const arg of args) {

        let msg = ''.padEnd(commandPadding + 3)

        msg += (arg.required ? `<${arg.name}>` : `[${arg.name}]`).padEnd(commandPadding) + ' '
        msg += arg.description ?? ''

        console.log(msg)
      }

      const opts = command.options
      for (const opt of opts) {

        let msg = ''.padEnd(commandPadding + 3)
        msg += (`--${opt.name} ${opt.name}`).padEnd(commandPadding) + ' '

        if (opt.required) {
          msg += '(required) '
        }

        msg += opt.description ?? ''

        if (opt.shortName) {
          msg += ` (short: -${opt.shortName})`
        }
        console.log(msg)
      }

      console.log()
    }
  }

  public async runCli(argv?: Array<string>) {
    argv ??= process.argv.slice(2)
    await this.runner.runCli(argv)
  }

  public getCommands() {
    return this.commandsDefinitions
  }

  protected addHelpCommand() {
    this.registerCommand({
      name: 'help',
      description: 'Print help',
      arguments: [],
      options: [],
      action: () => this.printHelp(),
    })
  }
}
