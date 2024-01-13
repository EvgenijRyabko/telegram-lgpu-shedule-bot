"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSheduleJobStatus = exports.stopSheduleJob = exports.startSheduleJob = void 0;
const cron_1 = require("cron");
const logger_1 = require("../utils/logger");
const fs_helper_1 = require("../utils/fs-helper");
const telegraf_1 = require("telegraf");
const axios_1 = require("axios");
require("dotenv/config");
const sendSheduleJob = new cron_1.CronJob('*/5 * * * *', (f) => f, undefined, true);
const sendShedule = async (info, telegram) => {
    try {
        const res = await axios_1.default.get('https://api.vk.com/method/wall.get', {
            params: {
                access_token: process.env.VK_API_TOKEN,
                v: process.env.VK_API_VERSION,
                domain: process.env.VK_GROUP_DOMEN,
            },
        });
        for (const post of res.data.response.items) {
            const text = post?.text?.toLowerCase();
            const isShedule = text?.includes('расписание');
            const isOFO = text?.includes('офо');
            const isBak = text?.includes('бакалавриат');
            if (isShedule && isOFO && isBak) {
                const shedule = post.attachments.find((el) => el.type === 'doc');
                const file = await (0, axios_1.default)({
                    url: shedule.doc.url,
                    method: 'GET',
                    responseType: 'arraybuffer',
                });
                const exist = await (0, fs_helper_1.checkPathExist)(`storage/${post.date}`);
                if (!exist) {
                    info.counter++;
                    await (0, fs_helper_1.mkdir)(`storage/${post.date}`);
                    const filename = shedule.doc.title;
                    await (0, fs_helper_1.writeFile)(`storage/${post.date}/${filename}`, file.data);
                    await telegram
                        .sendDocument(process.env.TG_GROUP_ID || 'Random', telegraf_1.Input.fromBuffer(file.data, filename))
                        .catch(async (e) => {
                        await logger_1.logger.error(e instanceof Error ? e.message : e, 'Telegram send document');
                    });
                }
            }
        }
    }
    catch (e) {
        info.errors.push(e instanceof Error ? e.message : e);
    }
    if (info.errors.length > 0) {
        for (const error of info.errors) {
            await logger_1.logger.error(error instanceof Error ? error.message : error);
        }
    }
    else {
        await logger_1.logger.log(`Job completed! Sended ${info.counter} files`, 'Cron');
    }
};
const startSheduleJob = async (info, telegram) => {
    sendSheduleJob.addCallback(async () => sendShedule(info, telegram));
    sendSheduleJob.start();
};
exports.startSheduleJob = startSheduleJob;
const stopSheduleJob = async () => {
    sendSheduleJob.stop();
};
exports.stopSheduleJob = stopSheduleJob;
const getSheduleJobStatus = async () => sendSheduleJob.running;
exports.getSheduleJobStatus = getSheduleJobStatus;
//# sourceMappingURL=sendSheduleJob.js.map