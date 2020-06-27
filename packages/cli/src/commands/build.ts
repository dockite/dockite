import { Command } from '@oclif/command';
import cli from 'cli-ux';

import { buildAdminUI } from '../utils';

export default class Build extends Command {
  static description = 'Build the Admin UI';

  async run(): Promise<void> {
    cli.action.start('Building the Admin UI', undefined, { stdout: true });

    await buildAdminUI();

    cli.action.stop();
  }
}
