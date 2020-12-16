/* eslint-disable */
const fs = require('fs');
const { camelCase } = require('lodash');

const { getDockiteFields } = require('./getDockiteConfig');
const webpack = require('webpack');

const template = `
export const importDockiteFields = async (): Promise<void> => {
  // eslint-disable-next-line
  await Promise.all([
    // WEBPACK_FIELD_REPLACEMENT_DO_NOT_MODIFY
  ]);
};

export default importDockiteFields;
`.replace(/^\n/, '');

const writeDockiteFieldsToFile = path => {
  const fields = getDockiteFields();

  const newContent = template.replace(
    '// WEBPACK_FIELD_REPLACEMENT_DO_NOT_MODIFY',
    fields
      .map(field => `import(/* webpackChunkName: "${camelCase(field)}" */ '${field}/lib/ui')`)
      .join(', '),
  );

  fs.writeFileSync(path, newContent, { flag: 'w+' });
};

const writeTemplateToFile = path => {
  fs.writeFileSync(path, template, { flag: 'w+' });
};

class DockiteFieldPlugin {
  constructor(path) {
    this.path = path;
  }

  /**
   *
   * @param {webpack.Compiler} compiler
   */
  apply(compiler) {
    if (process.env.WEBPACK_DEV_SERVER) {
      compiler.hooks.watchRun.tap('DockiteFieldPlugin:entryOption', () => {
        writeDockiteFieldsToFile(this.path);
      });
      compiler.hooks.watchClose.tap('DockiteFieldPlugin:watchClose', () => {
        writeTemplateToFile(this.path);
      });
    } else {
      compiler.hooks.run.tap('DockiteFieldPlugin:entryOption', () => {
        writeDockiteFieldsToFile(this.path);
      });

      compiler.hooks.done.tap('DockiteFieldPlugin:done', () => {
        writeTemplateToFile(this.path);
      });
    }
  }
}

module.exports = { writeDockiteFieldsToFile, DockiteFieldPlugin };
