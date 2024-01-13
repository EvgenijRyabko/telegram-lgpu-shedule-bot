"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportJobStatus = exports.stopReportJob = exports.startReportJob = void 0;
const cron_1 = require("cron");
const telegraf_1 = require("telegraf");
const fs_helper_1 = require("../utils/fs-helper");
require("dotenv/config");
const sendReportJob = new cron_1.CronJob('* 8,22 * * *', (f) => f, undefined, true);
const sendReport = async (info, status, telegram) => {
    await telegram.sendMessage(process.env.TG_COMMAND_GROUP_ID || 'Random string', `Отчет по работе бота:\n` +
        `Файлов отправлено: ${info.counter}\n` +
        `Ошибок: ${info.errors.length}\n` +
        `В данный момент бот ${status ? 'работает' : 'отключен'}`);
    if (info.errors.length) {
        await telegram.sendDocument(process.env.TG_COMMAND_GROUP_ID || 'Random string', telegraf_1.Input.fromLocalFile('error.log'));
    }
    const errorLogExist = await (0, fs_helper_1.checkPathExist)('error.log');
    const combinedLogExist = await (0, fs_helper_1.checkPathExist)('combined.log');
    if (errorLogExist) {
        await (0, fs_helper_1.clearFile)('error.log');
    }
    if (combinedLogExist) {
        await (0, fs_helper_1.clearFile)('combined.log');
    }
    info.counter = 0;
    info.errors = [];
};
const startReportJob = async (info, status, telegram) => {
    sendReportJob.addCallback(async () => sendReport(info, status, telegram));
    sendReportJob.start();
};
exports.startReportJob = startReportJob;
const stopReportJob = async () => {
    sendReportJob.stop();
};
exports.stopReportJob = stopReportJob;
const getReportJobStatus = async () => sendReportJob.running;
exports.getReportJobStatus = getReportJobStatus;
//# sourceMappingURL=sendReportJob.js.map