"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true,
});
exports.default = getMaxWorkers;
var os = require("os");

function getMaxWorkers(workers) {
    if (typeof workers === 'number') {
        return workers;
    }
    if (typeof os.availableParallelism === 'function') {
        return os.availableParallelism();
    }
    return os.cpus().length;
}
