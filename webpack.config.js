const fs = require('fs');
const path = require('path');
// const WorkboxPlugin = require('workbox-webpack-plugin');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const WebpackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = () => ({
  watch: false,
  // mode: env.prod ? 'production' : 'development',
  mode: 'development',
  // node: {
  //   global: false,
  //   __filename: 'mock',
  //   __dirname: 'mock'
  // },
  // mode: 'production',
  // devtool: env.prod ? 'source-map' : 'inline-source-map',
  devtool: 'inline-source-map',
  entry: {
    app: ['./src/main.js', './scss/styles.scss']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
    clean: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      fs: false,
      os: false,
      path: false,
      // tls: false,
      // net: false,
      // dgram: false,
      // process: false,
      // child_process: false,
      // setImmediate: false,
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.js$/, exclude: /node_modules/, use: ['babel-loader'] },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: { limit: 8192 }
        }
      },
      // this will apply to both plain `.scss` files
      // AND `<style lang="scss">` blocks in `.vue` files
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: '/' }
          },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              // Use Dart SASS
              // eslint-disable-next-line global-require
              implementation: require('sass'),
              sassOptions: { outputStyle: 'compressed' }
            }
          }
        ]
      },
      {
        /* See: https://webpack.js.org/guides/asset-management/#loading-fonts */
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        /* See: https://webpack.js.org/configuration/module/#rulegeneratorfilename */
        generator: {
          filename: './fonts/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    /* Deprecated see clean option in output */
    // new CleanWebpackPlugin(),
    new WebpackBar(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false'
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      chunks: ['runtime', 'vendors', 'app'],
      hash: false,
      publicPath: '/',
      base: '/',
      template: './index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].min.css',
      linkType: 'text/css'
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: './public', to: './' }]
    }),
    /* https://webpack.js.org/guides/progressive-web-application/#adding-workbox */
    // Disabled for development, can possibly use for production but dev server watch mode breaks it
    // new WorkboxPlugin.GenerateSW({
    //   // these options encourage the ServiceWorkers to get be fast
    //   // and not allow any straggling "old" SWs to hang around
    //   clientsClaim: true,
    //   skipWaiting: true,
    //   /* The options available are not documented. This was to solve the issue of 10mb fonts */
    //   maximumFileSizeToCacheInBytes: 10700000
    // }),
    new WebpackManifestPlugin({}),
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.js(\?.*)?$/i
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: {
          condition: /^\**!|@preserve|@license|@cc_on/i,
          // The "fileData" argument contains object with "filename", "basename", "query" and "hash"
          filename: (fileData) => `LICENSE.txt${fileData.query}`,
          banner: (licenseFile) => `License information can be found in ${licenseFile}`
        },
        terserOptions: {
          ecma: undefined,
          parse: {},
          compress: {},
          mangle: {
            properties: false,
            reserved: [
              'cookies',
              'i18next',
              'bootstrap'
            ]
          }
        }
      })
    ],
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  /* Works ok however there is no way to stop the pointless rebuild for static
   * Tried "spa-http-server": "^0.9.0" also "http-server": "^14.0.0" */
  devServer: {
    server: {
      type: 'https',
      options: {
        key: fs.readFileSync(path.join(__dirname, './vault/private/server.key')),
        cert: fs.readFileSync(path.join(__dirname, './vault/public/server.crt'))
      }
    },
    historyApiFallback: true,
    setupExitSignals: true,
    hot: false,
    liveReload: true,
    host: 'localhost',
    port: 443,
    static: {
      directory: './dist',
      watch: false
    }
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
});
