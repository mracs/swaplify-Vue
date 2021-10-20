module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000/',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
};
