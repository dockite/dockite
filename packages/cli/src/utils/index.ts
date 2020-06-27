import * as path from 'path';

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
  register({
    project: path.join(path.dirname(require.resolve('@dockite/admin')), 'tsconfig.json'),
    transpileOnly: true,
  });

  const loadOptions = {
    rootDir: path.dirname(require.resolve('@dockite/admin')),
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
