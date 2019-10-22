module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.externals = {
        react: 'React', // Case matters here
        'react-dom': 'ReactDOM', // Case matters here
      };

      if (env === 'production' && !process.env.REACT_APP_E2E_TESTING) {
        webpackConfig.output.library = 'datagateway-download';
        webpackConfig.output.libraryTarget = 'window';

        webpackConfig.output.filename = '[name].js';
        webpackConfig.output.chunkFilename = '[name].chunk.js';

        delete webpackConfig.optimization.splitChunks;
        webpackConfig.optimization.runtimeChunk = false;
      }

      return webpackConfig;
    },
  },
};
