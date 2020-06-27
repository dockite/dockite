/* eslint-disable no-param-reassign */
import * as path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import * as stream from 'stream';
import * as zlib from 'zlib';

import { Command } from '@oclif/command';
import cli from 'cli-ux';
import * as unzipper from 'unzipper';

import { buildAdminUI } from '../utils';

export default class CreateApp extends Command {
  static description = 'Create a Dockite application';

  static args = [
    {
      name: 'appName',
      required: true,
      description: 'The name of the application',
    },
  ];

  async run(): Promise<void> {
    const { args } = this.parse(CreateApp);

    cli.action.start(`Creating application: ${args.appName}`);

    const appPath = path.join(process.cwd(), args.appName);

    const exists = await new Promise(resolve => {
      fs.exists(appPath, resolve);
    });

    if (!exists) {
      fs.mkdirSync(appPath);
    }

    await new Promise(resolve => {
      https.get('https://codeload.github.com/dockite/template/zip/master', res => {
        if (res.headers['content-encoding'] === 'gzip') {
          const gunzip = zlib.createGunzip();

          res
            .pipe(gunzip)
            .pipe(unzipper.Parse())
            .pipe(
              // eslint-disable-next-line
              new stream.Transform({
                objectMode: true,
                transform(entry, _, cb): void {
                  if (entry.Type === 'File') {
                    entry.path = entry.path.replace('template-master/', ``);

                    entry
                      .pipe(fs.createWriteStream(path.join(appPath, entry.path)))
                      .on('finish', cb);
                  } else {
                    entry.autodrain();
                    cb();
                  }
                },
              }),
            )
            .on('close', () => resolve());
        } else {
          res
            .pipe(unzipper.Parse())
            .pipe(
              new stream.Transform({
                objectMode: true,
                transform(entry, _, cb): void {
                  if (entry.type === 'File') {
                    entry.path = entry.path.replace('template-master/', ``);

                    entry
                      .pipe(fs.createWriteStream(path.join(appPath, entry.path)))
                      .on('finish', cb);
                  } else {
                    entry.autodrain();
                    cb();
                  }
                },
              }),
            )
            .on('finish', resolve)
            .on('close', resolve);
        }
      });
    });

    cli.action.stop();
    cli.action.start('Building the Admin UI');

    await buildAdminUI(path.join(appPath, 'dist'));

    cli.action.stop();
  }
}
