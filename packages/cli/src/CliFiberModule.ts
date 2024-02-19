import {FiberModule} from '@silvertree/core'
import {CLI_COMMAND_ARGV_INJECT_KEY, CLI_COMMAND_CONFIG_INJECT_KEY, CLI_COMMAND_PARAMETER_INJECT_KEY} from './consts'
import {ICliArgv, ICliCommandConfig, TCliCommandPropertyMetadata} from './types'
import {CliError} from './exception'

export class CliFiberModule extends FiberModule {

  public bindCurrentCliCommandConfig(command: ICliCommandConfig) {
    this.bind.constant(CLI_COMMAND_CONFIG_INJECT_KEY, command)
  }

  public bindCurrentCliCommandArgv(argv: ICliArgv) {
    this.bind.constant(CLI_COMMAND_ARGV_INJECT_KEY, argv)
  }

  protected async setupDefaultBindings() {
    await super.setupDefaultBindings()
    this.bindCommandParamsFactory()
  }

  protected bindCommandParamsFactory() {
    this.bind.syncFunctional(
      CLI_COMMAND_PARAMETER_INJECT_KEY,
      (mod, opts, ctx) => {
        if (!opts || !opts.meta) {
          throw new CliError(`No metadata for command parameter factory`)
        }

        const prop = opts.meta as TCliCommandPropertyMetadata
        const argv = this.provideSync<ICliArgv>(CLI_COMMAND_ARGV_INJECT_KEY)

        // argument
        if (prop.type === 'argument') {
          return argv.args[prop.position] ?? null
        }

        // option
        if (prop.type === 'option') {
          let value: any = null

          if (prop.name in argv.options) {
            // --option value
            value = argv.options[prop.name]

          } else if (prop.shortName && prop.shortName in argv.optionsShort) {
            // -o value
            value = argv.optionsShort[prop.name]

          } else if (prop.default) {
            // default value
            value = prop.default()
          }

          if (prop.parser) {
            value = prop.parser(value)
          }

          if (prop.required && !value) {
            throw new CliError(`Option ${prop.name} is required`)
          }

          return value
        }

        throw new CliError(`Unknown command property type ${(prop as any).type}`)
      },
    )
  }

}
