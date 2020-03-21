module.exports = {
  lintOnSave: false,
  devServer: {
    proxy: {
      '^/dockite': {
        target: 'http://localhost:3000/',
        ws: true,
        changeOrigin: true,
      },
    },
  },
};
