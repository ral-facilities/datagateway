module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.externals = {
        react: 'React', // Case matters here
        'react-dom': 'ReactDOM', // Case matters here
      };

      if (env === 'production' && !import.meta.env.VITE_E2E_TESTING) {
        webpackConfig.output.library = 'datagateway-dataview';
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
