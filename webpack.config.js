var path = require("path")
var LiveReload = require('webpack-livereload-plugin')

module.exports = {
    devtool: 'source-map',
    entry: './client/src/main.js',
    output: {
        path: path.join(__dirname, "client/build"),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                include: [path.join(__dirname, 'client/src')],
                loader: 'babel-loader?cacheDirectory'
            }
        ]
    },
    plugins: [
        new LiveReload()
    ]
};