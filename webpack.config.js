let webpack = require('webpack')

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './front/index.jsx'
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'react-hot!babel'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: './public',
    publicPath: '/',
    filename: '/js/bundle.js'
  },
  devServer: {
    contentBase: './public',
    hot: true,
    proxy: {
      '*': 'http://localhost:3000'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
