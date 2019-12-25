const path = require( 'path' );
const { List, Map } = require( 'immutable' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const CleanWebpackPlugin = require( 'clean-webpack-plugin' );
const WebpackCleanPlugin = require( 'webpack-clean' );

const modeDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig = Map( {
  entry: {
    'manifest': './static/manifest.json',
  },
  output: Map( {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve( __dirname, 'dist' ),
  } ),
  module: {
    rules: [
      {
        test: /manifest.json$/,
        exclude: /node_modules/,
        loader: 'manifest-loader',
      },
    ],
  },
  plugins: List( [
    new CleanWebpackPlugin(
      [
        'dist',
      ]
    ),

    new CopyWebpackPlugin(
      [
        {
          from: './static',
          to: './',
        },
      ]
    ),
  ] ),
  resolveLoader: {
    modules: [
      path.resolve( __dirname, 'src', 'loaders' ),
      'node_modules',
    ],
  },
  devtool: modeDevelopment ?
    'inline-cheap-module-source-map' :
    false,
  watch: modeDevelopment,
} );

const supportedBrowsers = [
  'chromium',
  // @todo Add support for Firefox.
  // 'firefox',
];

module.exports = supportedBrowsers.map( browserName => {
  return defaultConfig
    // Create a separate dist folder for each browser
    .updateIn(
      [
        'output',
        'path',
      ],
      () => path.resolve( __dirname, 'dist', browserName ),
    )
    // Remove unused automatically-created JavaScript files post-build
    .updateIn(
      [
        'plugins',
      ],
      value => value.push(
        new WebpackCleanPlugin(
          [
            'manifest.js',
          ],
          {
            basePath: path.resolve( __dirname, 'dist', browserName ),
          },
        ),
      ),
    )
    .toJS()
    ;
} );
