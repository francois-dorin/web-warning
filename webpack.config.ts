const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('.\\node_modules\\copy-webpack-plugin\\dist');
const ZipPlugin = require('.\\node_modules\\zip-webpack-plugin');
const info = require('.\\src\\info.json');

module.exports = {
  entry: {
   'firefox/modules/service-worker/service-worker': ['./src/modules/service-worker/service-worker.ts'],
   'firefox/modules/content/content': ['./src/modules/content/content.ts'],
   'firefox/modules/options/options': ['./src/modules/options/options.ts'],
   'firefox/modules/popup/popup': ['./src/modules/popup/popup.ts' ],
   'chrome/manifest': ['./browsers/chrome/manifest.json'],
   'chrome/modules/content/content': ['./src/modules/content/content.ts'],
   'chrome/modules/options/options': ['./src/modules/options/options.ts'],
   'chrome/modules/popup/popup': ['./src/modules/popup/popup.ts'],
   'chrome/modules/service-worker/service-worker': ['./src/modules/service-worker/service-worker.ts'],

  },
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
       {
        test: /\.css$/i, 
        type: 'asset/source'
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
     
      // {
      //   test: /\.(html|css)$/,
      //   exclude: /node_modules/,
      //   use: 
      //   {
      //     loader: 'file-loader',
      //     options: {
      //       name: 'firefox/[name].[ext]'
      //     }
      //   }
      // },
      // {
      //   test: /\.(html|css)$/,
      //   exclude: /node_modules/,
      //   use: 
      //   {
      //     loader: 'file-loader',
      //     options: {
      //       name: 'chrome/[name].[ext]'
      //     }
      //   }
      // }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
   output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [   
    new webpack.DefinePlugin({
      '__EXTENSION_VERSION__': JSON.stringify(info.version)
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'modules/**/*.html', to: 'firefox', context: 'src'},
        { from: 'modules/**/*.css', to: 'firefox', context: 'src'},
        { from: '**/*.png', to: 'firefox', context: 'src'},
        { from: '**/*.ico', to: 'firefox', context: 'src'},
        { from: 'browsers/firefox', to: 'firefox', transform: {transformer: injectExtensionInformation}}
      ]
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'modules/**/*.html', to: 'chrome', context: 'src'},
        { from: 'modules/**/*.css', to: 'chrome', context: 'src'},
        { from: '**/*.png', to: 'chrome', context: 'src'},
        { from: '**/*.ico', to: 'chrome', context: 'src'},
        { from: 'browsers/chrome', to: 'chrome', transform: {transformer: injectExtensionInformation}}
      ]
    }),   
    new CopyWebpackPlugin({
      patterns: [
        {from: 'src/', to: 'source/src' },
        {from: 'browsers/', to: 'source' },
        {from: '*.json', to: 'source' },
        {from: 'README', to: 'source' },
        {from: '*.ts', to: 'source' },
      ]
    }),  
    new ZipPlugin({
      filename: `web-warning-chrome-v${info.version}.zip`,
      path: '../versions',
      exclude: [/\.zip$/, /^firefox\//, /^source\//],
      pathMapper: function(assetPath: string) {
        if (assetPath.startsWith('chrome/')) {
          return assetPath.substring('chrome/'.length);
        } else {
          return assetPath;
        }        
      },
    }),
    new ZipPlugin({
      filename: `web-warning-detector-firefox-v${info.version}.zip`,
      path: '../versions',
      exclude: [/\.zip$/, /^chrome\//, /^source\//],
      pathMapper: function(assetPath: string) {
        if (assetPath.startsWith('firefox/')) {
          return assetPath.substring('firefox/'.length);
        } else {
          return assetPath;
        }        
      },
    }),
    new ZipPlugin({
      filename: `web-warning-detector-source-v${info.version}.zip`,
      path: '../versions',
      exclude: [/\.zip$/, /^chrome\//, /^firefox\//],
      pathMapper: function(assetPath: string) {
        if (assetPath.startsWith('source/')) {
          return assetPath.substring('source/'.length);
        } else {
          return assetPath;
        }        
      },
    })    
  ]
};

function injectExtensionInformation(input: Buffer, absoluteFilename: string): string {
  return input.toString()
          .replaceAll('"__EXTENSION_VERSION__"', `"${info.version}"`)
          .replaceAll('"__EXTENSION_NAME__"', `"${info.name}"`)
          .replaceAll('"__EXTENSION_DESCRIPTION__"', `"${info.description}"`);
}