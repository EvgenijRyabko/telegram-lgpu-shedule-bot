"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.clearFile = exports.dropFile = exports.mkdir = exports.checkPathExist = void 0;
const fs = require("fs/promises");
const logger_1 = require("./logger");
async function checkPathExist(path) {
    try {
        await fs.access(path, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
exports.checkPathExist = checkPathExist;
async function mkdir(path) {
    try {
        await fs.mkdir(path, { recursive: true });
    }
    catch (e) {
        logger_1.logger.error(e instanceof Error ? e.message : e, 'FS');
    }
}
exports.mkdir = mkdir;
async function dropFile(path, handler = (e) => e) {
    await fs
        .unlink(path)
        .then(handler)
        .catch((e) => {
        logger_1.logger.error(e instanceof Error ? e.message : e, 'FS');
    });
}
exports.dropFile = dropFile;
async function clearFile(path) {
    try {
        await fs.truncate(path);
    }
    catch (e) {
        logger_1.logger.error(e instanceof Error ? e.message : e, 'FS');
    }
}
exports.clearFile = clearFile;
async function writeFile(path, data) {
    try {
        await fs.writeFile(path, data);
    }
    catch (e) {
        logger_1.logger.error(e instanceof Error ? e.message : e, 'FS');
    }
}
exports.writeFile = writeFile;
//# sourceMappingURL=fs-helper.js.map