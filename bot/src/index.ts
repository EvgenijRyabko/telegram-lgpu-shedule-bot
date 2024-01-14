import { Input, Telegraf, Telegram } from 'telegraf';
import { logger } from './utils/logger';
import { startSheduleJob, getSheduleJobStatus, stopSheduleJob } from './cron/sendSheduleJob';
import { getReportJobStatus, startReportJob, stopReportJob } from './cron/sendReportJob';
import 'dotenv/config.js';

const info: {
  counter: number;
  errors: Error[] | string[];
} = {
  counter: 0,
  errors: [],
};

const botToken = process.env.BOT_TOKEN || 'Not token';

const bot = new Telegraf(botToken);
const telegram = new Telegram(botToken);

const start = () => {
  try {
    bot.launch();

    console.log('⚡⚡⚡  Bot started  ⚡⚡⚡');

    (async () => {
      const status = await getSheduleJobStatus();

      await startReportJob(info, status, telegram);
      await startSheduleJob(info, telegram);
    })();
  } catch (e) {
    logger.error(e, 'Bot');
  }
};

const menu = () => ({
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Получить файл логов', callback_data: 'GET_LOGS' },
        { text: 'Получить файл ошибок', callback_data: 'GET_ERRORS' },
      ],
      [
        { text: 'Запустить отчеты', callback_data: 'START_REPORTS' },
        { text: 'Остановить отчеты', callback_data: 'STOP_REPORTS' },
      ],
      [{ text: 'Состояние отчетов', callback_data: 'STATUS_REPORTS' }],
      [
        { text: 'Запустить расписание', callback_data: 'START_SHEDULE' },
        { text: 'Остановить расписание', callback_data: 'STOP_SHEDULE' },
      ],
      [{ text: 'Состояние расписания', callback_data: 'STATUS_SHEDULE' }],
    ],
  },
});

bot.start((ctx) => {
  ctx.reply('Выберите пункт меню:', menu());
});

bot.on('message', (ctx) => {
  if (
    ctx.update.message.from.id === Number(process.env.TG_ADMIN_ID) &&
    ctx.update.message.chat.type === 'private'
  )
    ctx.reply('🔵   *Меню*\n\n_Выберите пункт меню:_\n', {
      ...menu(),
      parse_mode: 'MarkdownV2',
    });
});

bot.action('GET_LOGS', async (ctx) => {
  try {
    await ctx.sendDocument(Input.fromLocalFile('combined.log'));
    await logger.log('Sended log', 'Bot');

    ctx.answerCbQuery('Done');
    ctx.reply('Выберите пункт меню:', menu());
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка при попытке загрузить файл. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('GET_ERRORS', async (ctx) => {
  try {
    await ctx.sendDocument(Input.fromLocalFile('error.log'));
    await logger.log('Sended error log', 'Bot');

    ctx.answerCbQuery('Done');
    ctx.reply('Выберите пункт меню:', menu());
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка при попытке загрузить файл. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('START_SHEDULE', async (ctx) => {
  try {
    await startSheduleJob(info, telegram);
    await logger.log('Shedule Job started', 'Cron');

    ctx.answerCbQuery('Shedule started');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('STOP_SHEDULE', async (ctx) => {
  try {
    await stopSheduleJob();
    await logger.log('Shedule Job stopped', 'Cron');

    ctx.answerCbQuery('Shedule stopped');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('STATUS_SHEDULE', async (ctx) => {
  try {
    const status = await getSheduleJobStatus();
    await logger.log(`Checked shedule status`, 'Cron');

    ctx.answerCbQuery(`Shedule ${status ? 'running' : 'stopped'}`);
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('START_REPORTS', async (ctx) => {
  try {
    const status = await getSheduleJobStatus();
    await startReportJob(info, status, telegram);
    await logger.log('Report Job started', 'Cron');

    ctx.answerCbQuery('Reports started');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('STOP_REPORTS', async (ctx) => {
  try {
    await stopReportJob();
    await logger.log('Report Job stopped', 'Cron');

    ctx.answerCbQuery('Reports stopped');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

bot.action('STATUS_REPORTS', async (ctx) => {
  try {
    const status = await getReportJobStatus();
    await logger.log(`Checked report status`, 'Cron');

    ctx.answerCbQuery(`Reports ${status ? 'running' : 'stopped'}`);
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu());
  }
});

start();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
