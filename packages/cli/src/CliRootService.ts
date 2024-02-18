import {Command, createCommand} from 'commander'
import {Inject, InjectModuleConfig} from '@silvertree/core'
import {ICliRootModuleConfig} from './types'
import {CliRunnerService} from './CliRunnerService'

export class CliRootService {

  @InjectModuleConfig()
  protected readonly config!: ICliRootModuleConfig

  @Inject(CliRunnerService)
  protected readonly registrar!: CliRunnerService

  protected cli!: Command

  public getRootCommand() {
    if (this.cli) {
      return this.cli
    }

    this.cli = createCommand(this.config.appName ?? 'app')

    return this.cli
  }

  public isInitialized() {
    return !!this.cli
  }

  public async runCli(argv?: Array<string>) {
    const cli = this.getRootCommand()

    this.registrar.registerPendingCommands()

    await cli.parseAsync(argv)

    if (cli.args.length === 0) {
      cli.outputHelp({error: true})
      process.exit(1)
    }

    if (this.config.closeOnCommandPromiseResolved) {
      process.exit(0)
    }
  }
}
