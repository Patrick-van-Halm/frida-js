import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

import { startFridaServer, stopFridaServer } from './test/run-frida-server';

startFridaServer().then((server) => server.unref());
process.on('exit', async (code: number) => {
    stopFridaServer();
    process.exit(code);
});

const CONTINUOUS = process.env.CONTINUOUS_TEST === 'true';
const HEADFUL = process.env.HEADFUL_TEST === 'true';
const CI = process.env.CI;

module.exports = function(config: any) {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            'test/**/*.spec.ts'
        ],
        preprocessors: {
            'src/**/*.ts': ['esbuild'],
            'test/**/*.ts': ['esbuild']
        },
        esbuild: {
            format: 'esm',
            target: 'esnext',
            external: [
                './test/run-frida-server',
                'child_process'
            ],
            plugins: [
                NodeModulesPolyfillPlugin(),
                NodeGlobalsPolyfillPlugin({
                    process: true,
                    buffer: true
                })
            ]
        },
        plugins: [
            'karma-chrome-launcher',
            'karma-chai',
            'karma-mocha',
            'karma-spec-reporter',
            'karma-esbuild'
        ],
        reporters: ['spec'],
        port: 9876,
        logLevel: config.LOG_INFO,

        customLaunchers: {
            ChromeCI: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },

        browsers:
            CI // To run in CI environment:
                ? ['ChromeCI']
            : HEADFUL // Full debugging:
                ? ['Chrome']
            // Normal local usage:
                : ['ChromeHeadless'],

        autoWatch: CONTINUOUS,
        singleRun: !CONTINUOUS
    });
};