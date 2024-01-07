import { Input, Telegraf } from 'telegraf';
import { logger } from './utils/logger.js';
import { startSheduleJob, stopSheduleJob, getSheduleJobStatus } from './cron/sendSheduleJob.js';
import { startReportJob, stopReportJob, getReportJobStatus } from './cron/sendReportJob.js';
import 'dotenv/config.js';

const info = {
  counter: 0,
  errors: [],
};

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.launch().catch((e) => {
  logger.error(e, 'Bot');
});

bot.command('getLog', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await ctx.sendDocument(Input.fromLocalFile('combined.log'));
    await logger.log('Sended log', 'Bot');
  }
});

bot.command('getErrors', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await ctx.sendDocument(Input.fromLocalFile('error.log'));
    await logger.log('Sended error log', 'Bot');
  }
});

bot.command('startShedule', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await startSheduleJob(info);
    await logger.log('Shedule Job started', 'Cron');
  }
});

bot.command('stopShedule', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await stopSheduleJob();
    await logger.log('Shedule Job stopped', 'Cron');
  }
});

bot.command('sheduleStatus', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    const status = await getSheduleJobStatus();
    await ctx.sendMessage(`${status ? 'Cron is now running' : 'Cron is stopped'}`);
    await logger.log(`Checked shedule status`, 'Cron');
  }
});

bot.command('startReport', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    const status = await getSheduleJobStatus();
    await startReportJob(info, status);
    await logger.log('Report Job started', 'Cron');
  }
});

bot.command('stopReport', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await stopReportJob();
    await logger.log('Report Job stopped', 'Cron');
  }
});

bot.command('reportStatus', async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    const status = await getReportJobStatus();
    await ctx.sendMessage(`${status ? 'Cron is now running' : 'Cron is stopped'}`);
    await logger.log(`Checked report status`, 'Cron');
  }
});

(async () => {
  const status = await getSheduleJobStatus();

  await startReportJob(info, status);
  await startSheduleJob(info);
})();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
