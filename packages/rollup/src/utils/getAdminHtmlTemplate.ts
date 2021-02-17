import { RollupHtmlTemplateOptions } from '@rollup/plugin-html';

export const makeHtmlAttributes = (attributes: Record<string, any>): string => {
  if (!attributes) {
    return '';
  }

  const keys = Object.keys(attributes);

  return keys.reduce((result, key) => `${result} ${key}="${attributes[key]}"`, '');
};

export const getAdminHtmlTemplate = ({
  title,
  attributes,
  files,
  meta,
  publicPath,
}: RollupHtmlTemplateOptions): string => {
  const scripts = (files.js || [])
    .filter(file => {
      return file.fileName.includes('main');
    })
    .map(file => `<script type="module" src="${publicPath}${file.fileName}" async defer></script>`);

  const chunks = (files.js || []).map(
    file => `<link rel="prefetch" href="${publicPath}${file.fileName}" as="script">`,
  );

  const links = (files.css || []).map(({ fileName }) => {
    const attrs = makeHtmlAttributes(attributes.link);
    return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
  });

  const metas = meta.map(input => {
    const attrs = makeHtmlAttributes(input);
    return `<meta${attrs}>`;
  });

  return `
  <!doctype html>
  <html${makeHtmlAttributes(attributes.html)}>
    <head>
      ${metas.join('\n')}
      <title>${title}</title>
      ${chunks.join('\n')}
      ${links.join('\n')}
    </head>
    <body>
      <div id="app"></div>
      ${scripts.join('\n')}
    </body>
  </html>`;
};
