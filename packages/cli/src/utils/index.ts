import * as path from 'path';

import * as fse from 'fs-extra';
import { loadNuxtConfig, Builder, Generator, Nuxt } from 'nuxt';
import { register } from 'ts-node';

async function getBuilder(nuxt: any): Promise<any> {
  const { BundleBuilder } = await import('@nuxt/webpack');

  return new Builder(nuxt, BundleBuilder);
}

async function getGenerator(nuxt: any): Promise<any> {
  const builder = await getBuilder(nuxt);

  return new Generator(nuxt, builder);
}

async function getNuxt(options: any): Promise<any> {
  const nuxt = new Nuxt(options);

  await nuxt.ready();

  return nuxt;
}

export async function buildAdminUI(distPath?: string): Promise<void> {
  module.paths.push(path.join(process.cwd(), 'node_modules'));

  const buildDir = path.join(process.cwd(), '.build');
  const replaceDir = path.join(process.cwd(), '.overrides');
  const srcDir = path.dirname(require.resolve('@dockite/admin'));

  if (!fse.existsSync(buildDir)) {
    fse.mkdirSync(buildDir);
  }

  fse.copySync(srcDir, buildDir, {
    filter: src => !/node_modules/.test(src.replace(srcDir, '')),
    recursive: true,
    overwrite: true,
  });

  if (fse.existsSync(replaceDir)) {
    fse.copySync(replaceDir, buildDir, {
      recursive: true,
      overwrite: true,
    });
  }

  register({
    project: path.join(buildDir, 'tsconfig.json'),
    transpileOnly: true,
    // eslint-disable-next-line
    ignore: ['/node_modules\/(?!@dockite\/admin.*)/'],
  });

  const loadOptions = {
    rootDir: buildDir,
  };

  let config = await loadNuxtConfig(loadOptions);

  config = Object.assign(config, { dev: false, server: false, _build: true });

  config.server = config.mode === 'spa' || config.ssr === false;

  const nuxt = await getNuxt(config);

  if (distPath) {
    nuxt.options.generate = Object.assign(nuxt.options.generate, {
      dir: path.resolve(distPath),
    });
  } else {
    nuxt.options.generate = Object.assign(nuxt.options.generate, {
      dir: path.join(process.cwd(), 'dist'),
    });
  }

  const generator = await getGenerator(nuxt);

  await generator.generate({ build: true });
}

export async function startAdminUIDevServer(): Promise<void> {
  module.paths.push(path.join(process.cwd(), 'node_modules'));

  const buildDir = path.join(process.cwd(), '.build');
  const replaceDir = path.join(process.cwd(), '.overrides');
  const srcDir = path.dirname(require.resolve('@dockite/admin'));

  if (!fse.existsSync(buildDir)) {
    fse.mkdirSync(buildDir);
  }

  fse.copySync(srcDir, buildDir, {
    filter: src => !/node_modules/.test(src.replace(srcDir, '')),
    recursive: true,
    overwrite: true,
  });

  if (fse.existsSync(replaceDir)) {
    fse.copySync(replaceDir, buildDir, {
      recursive: true,
      overwrite: true,
    });
  }

  register({
    project: path.join(buildDir, 'tsconfig.json'),
    transpileOnly: true,
    // eslint-disable-next-line
    ignore: ['/node_modules\/(?!@dockite\/admin.*)/'],
  });

  const loadOptions = {
    rootDir: buildDir,
  };

  let config = await loadNuxtConfig(loadOptions);

  config = Object.assign(config, { dev: true, _build: true });

  const nuxt = await getNuxt(config);

  await nuxt.server.listen();

  const builder = await getBuilder(nuxt);

  await builder.build();

  // Display server urls after the build
  nuxt.server.listeners.forEach((listener: any) => {
    console.log(`Listening on: ${listener.url}`);
  });
}

export const tidyBuildDirs = (): void => {
  const buildDir = path.join(process.cwd(), '.build');

  if (fse.existsSync(buildDir)) {
    fse.removeSync(buildDir);
  }
};
