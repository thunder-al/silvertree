import {ICliArgv, ICliCommandConfig} from './types'
import {CliRootService} from './CliRootService'
import {callClassMethodWithAsyncInjections, InjectFromRef, InjectModule, resolveBindingKey} from '@silvertree/core'
import {CliFiberModule} from './CliFiberModule'
import {CliRootModule} from './CliRootModule'
import {CliCommandNotFoundError} from './exception'
import {parseArgv} from './util'

export class CliRunnerService {

  @InjectFromRef(() => CliRootService)
  protected readonly cliService!: CliRootService

  @InjectModule()
  protected readonly module!: CliRootModule

  public async runModuleCommand(config: ICliCommandConfig, argv: ICliArgv) {
    if (!config.action || typeof config.action === 'function') {
      throw new Error(`Command "${config.name}" has invalid module action`)
    }

    const baseModule = config.action.module
    const mod = new CliFiberModule(baseModule.getContainer(), baseModule)

    mod.bindCurrentCliCommandConfig(config)
    mod.bindCurrentCliCommandArgv(argv)
    await mod.init()

    const key = resolveBindingKey(config.action.binding)
    const svc = await mod.provideAsync<any>(key)

    await callClassMethodWithAsyncInjections(
      mod,
      key,
      svc,
      config.action.method,
    )
  }

  public async runFunctionCommand(config: ICliCommandConfig, argv: ICliArgv) {
    if (!config.action || typeof config.action !== 'function') {
      throw new Error(`Command "${config.name}" has invalid function action`)
    }

    await config.action(this.module.getContainer(), argv)
  }

  protected lookupCommand(argv: Array<string>): ICliCommandConfig {
    const commands = this.cliService.getCommands()
    let command: ICliCommandConfig | null = null

    for (const commandName of commands.keys()) {
      const commandPath = commandName.split(' ')
      let matched = true

      for (const [i, part] of commandPath.entries()) {
        if (part !== argv[i]) {
          matched = false
          break
        }
      }

      if (matched && (!command || command.name.length < commandName.length)) {
        command = commands.get(commandName)!
      }
    }

    if (!command) {
      throw new CliCommandNotFoundError(argv.join(' '))
    }

    return command
  }

  public async runCli(argv: Array<string>) {
    const command = this.lookupCommand(argv)
    const args = parseArgv(argv, command.name)

    if (typeof command.action === 'function') {
      await this.runFunctionCommand(command, args)
      return
    }

    await this.runModuleCommand(command, args)
  }
}
