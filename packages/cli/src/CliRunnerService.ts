import {ICliCommandConfig} from './types'
import {CliRootService} from './CliRootService'
import {callClassMethodWithAsyncInjections, InjectFromRef, Module, resolveBindingKey, TBindKey} from '@silvertree/core'
import {Argument, Command} from 'commander'
import {CliFiberModule} from './CliFiberModule'
import {getCommandHandlerCommandMetadata, getCommandHandlerCommandPropertiesMetadata} from './metadata'

export class CliRunnerService {

  @InjectFromRef(() => CliRootService)
  protected readonly cliService!: CliRootService

  protected readonly pendingCommands = new Set<ICliCommandConfig>()

  public registerCommand(config: ICliCommandConfig) {
    const baseCmd = config.name.indexOf(' ') !== -1
      ? this.makeSubcommand({name: config.name.slice(0, config.name.lastIndexOf(' '))})
      : this.cliService.getRootCommand()

    const name = config.name.slice(config.name.lastIndexOf(' ') + 1)

    if (baseCmd.commands.some(c => c.name() === name || c.aliases().includes(name))) {
      throw new Error(`Command "${config.name}" already exists`)
    }

    const cmd = baseCmd.command(name)

    if (config.description) {
      cmd.description(config.description)
    }

    if (config.aliases) {
      cmd.aliases(config.aliases)
    }

    if (config.arguments) {
      for (const arg of config.arguments) {
        cmd.addArgument(arg)
      }
    }

    if (config.options) {
      for (const opt of config.options) {
        cmd.addOption(opt)
      }
    }

    if (!config.action) {
      throw new Error(`Command "${config.name}" has no action`)
    }

    if (typeof config.action === 'function') {
      cmd.action(config.action)
    } else {
      cmd.action(async (args) => {
        const commandContext: Command = args[args.length - 1]
        await this.runModuleCommand(
          config,
          commandContext,
          baseCmd,
        )
      })
    }

    return cmd
  }

  public registerPendingCommands() {
    for (const cmd of this.pendingCommands) {
      this.registerCommand(cmd)
    }

    this.pendingCommands.clear()
  }

  public makeSubcommand(cmdConfig: ICliCommandConfig) {
    const cli = this.cliService.getRootCommand()

    const parts = cmdConfig.name.split(/\s+/ig)
    let cmd = cli

    while (parts.length > 0) {
      const part = parts.shift()!
      let scopeCmd = cmd.commands.find(c => c.name() === part || c.aliases().includes(part))

      if (!scopeCmd) {
        scopeCmd = cmd.command(part)
      }

      cmd = scopeCmd
    }

    if (cmdConfig.description) {
      cmd.description(cmdConfig.description)
    }

    return cmd
  }

  public async runModuleCommand(config: ICliCommandConfig, command: Command, baseCmd: Command) {
    if (!config.action || typeof config.action === 'function') {
      throw new Error(`Command "${config.name}" has invalid module action`)
    }

    const baseModule = config.action.module
    const mod = new CliFiberModule(baseModule.getContainer(), baseModule)

    mod.bindCurrentCliCommand(command)
    mod.bindBaseCliCommand(baseCmd)

    const key = resolveBindingKey(config.action.binding)
    const svc = await mod.provideAsync<any>(key)

    await callClassMethodWithAsyncInjections(
      mod,
      key,
      svc,
      config.action.method,
    )
  }

  public registerCommandsFromHandler(
    module: Module,
    handlerKey: TBindKey,
  ) {
    const commandConfigs = getCommandHandlerCommandMetadata(handlerKey)

    for (const cmdConf of commandConfigs) {
      const pending: ICliCommandConfig = {
        name: cmdConf.name,
        description: cmdConf.description,
        aliases: cmdConf.aliases,
        arguments: [],
        options: [],
        action: {
          module,
          binding: handlerKey,
          method: cmdConf.method as string,
        },
      }

      const props = getCommandHandlerCommandPropertiesMetadata(handlerKey, cmdConf.method)

      const args = props.filter(p => p.type === 'argument').sort((a, b) => a.index - b.index)

      for (const argMeta of args) {
        const arg = new Argument(argMeta.name, argMeta.description)
        arg.required = argMeta.required
        arg.defaultValue = argMeta.default
        if (argMeta.parser) {
          arg.argParser(argMeta.parser)
        }
      }

      this.pendingCommands.add(pending)
    }

    if (this.cliService.isInitialized()) {
      this.registerPendingCommands()
    }
  }
}
