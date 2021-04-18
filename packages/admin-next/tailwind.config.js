module.exports = {
  corePlugins: {
    corePlugins: {
      outline: false,
    },
  },
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  purge: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      blur: ['hover', 'focus'],
      borderWidth: ['last'],
    },
  },
  plugins: [],
};
