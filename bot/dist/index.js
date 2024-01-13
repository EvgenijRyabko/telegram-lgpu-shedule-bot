"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const logger_1 = require("./utils/logger");
const sendSheduleJob_1 = require("./cron/sendSheduleJob");
const sendReportJob_1 = require("./cron/sendReportJob");
require("dotenv/config.js");
const info = {
    counter: 0,
    errors: [],
};
const botToken = process.env.BOT_TOKEN || 'Not token';
const bot = new telegraf_1.Telegraf(botToken);
const telegram = new telegraf_1.Telegram(botToken);
bot.launch().catch((e) => {
    logger_1.logger.error(e, 'Bot');
});
bot.command('getLog', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        await ctx.sendDocument(telegraf_1.Input.fromLocalFile('combined.log'));
        await logger_1.logger.log('Sended log', 'Bot');
    }
});
bot.command('getErrors', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        await ctx.sendDocument(telegraf_1.Input.fromLocalFile('error.log'));
        await logger_1.logger.log('Sended error log', 'Bot');
    }
});
bot.command('startShedule', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        await (0, sendSheduleJob_1.startSheduleJob)(info, telegram);
        await logger_1.logger.log('Shedule Job started', 'Cron');
    }
});
bot.command('stopShedule', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        await (0, sendSheduleJob_1.stopSheduleJob)();
        await logger_1.logger.log('Shedule Job stopped', 'Cron');
    }
});
bot.command('sheduleStatus', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        const status = await (0, sendSheduleJob_1.getSheduleJobStatus)();
        await ctx.sendMessage(`${status ? 'Cron is now running' : 'Cron is stopped'}`);
        await logger_1.logger.log(`Checked shedule status`, 'Cron');
    }
});
bot.command('startReport', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        const status = await (0, sendSheduleJob_1.getSheduleJobStatus)();
        await (0, sendReportJob_1.startReportJob)(info, status, telegram);
        await logger_1.logger.log('Report Job started', 'Cron');
    }
});
bot.command('stopReport', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        await (0, sendReportJob_1.stopReportJob)();
        await logger_1.logger.log('Report Job stopped', 'Cron');
    }
});
bot.command('reportStatus', async (ctx) => {
    if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
        const status = await (0, sendReportJob_1.getReportJobStatus)();
        await ctx.sendMessage(`${status ? 'Cron is now running' : 'Cron is stopped'}`);
        await logger_1.logger.log(`Checked report status`, 'Cron');
    }
});
(async () => {
    const status = await (0, sendSheduleJob_1.getSheduleJobStatus)();
    await (0, sendReportJob_1.startReportJob)(info, status, telegram);
    await (0, sendSheduleJob_1.startSheduleJob)(info, telegram);
})();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
//# sourceMappingURL=index.js.map