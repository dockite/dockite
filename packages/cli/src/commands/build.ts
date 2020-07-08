import { Command } from '@oclif/command';

import { buildAdminUI } from '../utils';

export default class Build extends Command {
  static description = 'Build the Admin UI';

  async run(): Promise<void> {
    console.log('Building the Admin UI');

    process.env.CLI_BUILD = 'true';
    await buildAdminUI();
  }
}
