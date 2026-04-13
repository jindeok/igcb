// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const os = require('os');

// Polyfill for Node < 18.14.0
if (!os.availableParallelism) {
    os.availableParallelism = () => {
        return os.cpus().length;
    };
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
