/* eslint-disable @typescript-eslint/explicit-function-return-type */
module.exports = {
  '*.{js,jsx,ts,tsx,vue}': files => `eslint --fix ${files.join(' ')}`,
  '*.tsx?': () => 'tsc -p tsconfig.json --noEmit',
};
