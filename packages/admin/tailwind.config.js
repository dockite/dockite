module.exports = {
  purge: {
    enabled: false,
  },
  extend: {
    height: _ => ({
      'screen-10': '10vh',
      'screen-20': '20vh',
      'screen-30': '30vh',
      'screen-40': '40vh',
      'screen-50': '50vh',
      'screen-60': '60vh',
      'screen-70': '70vh',
      'screen-80': '80vh',
      'screen-90': '90vh',
      'screen-100': '100vh',
    }),
  },
  //   corePlugins: {
  //       preflight: false,
  //   }
};
