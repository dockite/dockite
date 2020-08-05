import { Command } from '@oclif/command';

import { buildAdminUI, tidyBuildDirs } from '../utils';

export default class Build extends Command {
  static description = 'Build the Admin UI';

  async run(): Promise<void> {
    console.log('Building the Admin UI');

    process.env.CLI_BUILD = 'true';

    process.on('exit', () => tidyBuildDirs());
    process.on('SIGINT', () => tidyBuildDirs());
    process.on('SIGKILL', () => tidyBuildDirs());

    await buildAdminUI();
  }
}
