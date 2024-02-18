import {FiberModule} from '@silvertree/core'
import {Command} from 'commander'
import {CLI_BASE_COMMAND_INJECT_KEY, CLI_CURRENT_COMMAND_INJECT_KEY} from './consts'

export class CliFiberModule extends FiberModule {

  public bindCurrentCliCommand(command: Command) {
    this.bind.syncFunctional(
      CLI_CURRENT_COMMAND_INJECT_KEY,
      () => command,
      {singleton: false},
    )
  }

  public bindBaseCliCommand(command: Command) {
    this.bind.syncFunctional(
      CLI_BASE_COMMAND_INJECT_KEY,
      () => command,
      {singleton: false},
    )
  }


}
