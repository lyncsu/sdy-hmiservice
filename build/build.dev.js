'use strict';

const chalk = require('chalk');
const webpack = require('webpack');
const webpackProd = require('./webpack.dev.prod.conf');

webpack(webpackProd, (error, stats) => {
    if (error) {
        throw error;
    }
    process.stdout.write(
        stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        }) + '\n\n',
    );

    if (stats.hasErrors()) {
        console.log(chalk.red('  Build failed with errors.\n'));
        process.exit(1);
    }

    console.log(chalk.cyan('  Build complete!\n'));
    console.log(chalk.yellow('Tips:\n· Check out your SDK in ./dist folder\n'));
});
