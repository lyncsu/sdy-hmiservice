'use strict';

const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const packageConf = require('../package.json');
const webpackBase = require('./webpack.base.conf');
const util = require('./util');
const { needBundleReport } = util.parseProcVariable();
const TerserPlugin = require('terser-webpack-plugin');

// 继承并注入生产环境配置
const webpackProd = merge(webpackBase, {
    mode: 'production',
    stats: 'errors-only',
    entry: {
        hmiService: {
            import: './src/HmiService.js',
            filename: `hmiservice.min.js`,
            library: {
                name: 'hmiService',
                type: 'umd',
                umdNamedDefine: true,
                export: 'default',
            },
        },
    },
    output: {
        path: path.resolve(__dirname, '../dist/lib'),
        clean: true,
        // strictModuleErrorHandling: true,
        // wasmLoading: 'fetch',
        // enabledWasmLoadingTypes: ['fetch'],
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
        // chunkIds: 'named',
        // splitChunks: {
        //   minSize: {
        //     javascript: 30000,
        //     webassembly: 50000,
        //   },
        // },
    },
    plugins: [new webpack.ProgressPlugin({ percentBy: 'entries' })],
});

// 生成打包报告
if (needBundleReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    webpackProd.plugins.push(
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            generateStatsFile: true,
            statsFilename: 'report.spec.json',
            statsOptions: 'normal',
        }),
    );
}

module.exports = webpackProd;
