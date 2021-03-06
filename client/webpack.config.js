var path = require("path")

module.exports = {
    devtool: 'eval-source-map',
    entry: './src/main.js',
    output: {
        path: path.join(__dirname, "build"),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?cacheDirectory'
            }
        ]
    }
};