import { Telegraf, Telegram } from 'telegraf';
import { logger } from './utils/logger';
import { startSheduleJob, getSheduleJobStatus, stopSheduleJob } from './cron/sendSheduleJob';
import { getReportJobStatus, startReportJob, stopReportJob } from './cron/sendReportJob';
import 'dotenv/config.js';
import { getFileText } from './utils/fs-helper';
import { menu, paginationMenu } from './menus';

const info: {
  counter: number;
  errors: Error[] | string[];
  messageId: number | undefined;
} = {
  counter: 0,
  errors: [],
  messageId: 0,
};

const pagination: {
  total: number;
  perPage: number;
  page: number;
  lastPage: number;
  data: string;
} = {
  total: 0,
  perPage: 500,
  page: 1,
  lastPage: 0,
  data: '',
};

const botToken = process.env.BOT_TOKEN || 'Not token';

const bot = new Telegraf(botToken);
const telegram = new Telegram(botToken);

const start = () => {
  try {
    bot.launch();

    console.log('⚡⚡⚡  Bot started  ⚡⚡⚡');
  } catch (e) {
    logger.error(e, 'Bot');
  }
};

bot.start(async (ctx) => {
  try {
    const { message_id } = await ctx.reply('Выберите пункт меню:', menu);

    info.messageId = message_id;

    const status = await getSheduleJobStatus();

    await startReportJob(info, status, telegram);
    await startSheduleJob(info, telegram);
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');
  }
});

bot.action('TO_MAIN', async (ctx) => {
  try {
    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      '🔵   *Меню*\n\n_Выберите пункт меню:_\n',
      {
        ...menu,
        parse_mode: 'MarkdownV2',
      },
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');
  }
});

bot.action('GET_LOGS', async (ctx) => {
  try {
    const text = await getFileText('combined.log');

    if (text && text.length > 500) {
      pagination.total = text.length;
      pagination.lastPage = Math.ceil(pagination.total / pagination.perPage);

      pagination.data = text;

      const croppedText = text.slice(0, pagination.perPage);

      const res = await ctx.telegram.editMessageText(
        process.env.TG_ADMIN_ID,
        info.messageId,
        undefined,
        croppedText || 'Ошибка чтения логов',
        paginationMenu(pagination),
      );

      info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
    } else {
      const res = await ctx.telegram.editMessageText(
        process.env.TG_ADMIN_ID,
        info.messageId,
        undefined,
        text || 'Ошибка чтения логов',
        {
          reply_markup: {
            inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
          },
        },
      );

      info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
    }

    ctx.answerCbQuery('Done');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      'Произошла ошибка при попытке загрузить файл. Пожалуйста, попробуйте позже!',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
        },
      },
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;

    ctx.answerCbQuery('Error');
  }
});

bot.action('GET_ERRORS', async (ctx) => {
  try {
    const text = await getFileText('error.log');

    if (text && text.length > 500) {
      pagination.total = text.length;
      pagination.lastPage = Math.ceil(pagination.total / pagination.perPage);

      pagination.data = text;

      const croppedText = text.slice(0, pagination.perPage);

      const res = await ctx.telegram.editMessageText(
        process.env.TG_ADMIN_ID,
        info.messageId,
        undefined,
        croppedText || 'Ошибка чтения логов',
        paginationMenu(pagination),
      );

      info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
    } else {
      const res = await ctx.telegram.editMessageText(
        process.env.TG_ADMIN_ID,
        info.messageId,
        undefined,
        text || 'Ошибка чтения логов',
        {
          reply_markup: {
            inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
          },
        },
      );

      info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
    }

    ctx.answerCbQuery('Done');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      'Произошла ошибка при попытке загрузить файл. Пожалуйста, попробуйте позже!',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
        },
      },
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;

    ctx.answerCbQuery('Error');
  }
});

bot.action('NEXT_PAGE', async (ctx) => {
  try {
    pagination.page =
      pagination.page === pagination.lastPage ? pagination.page : pagination.page + 1;

    const offset = (pagination.page - 1) * pagination.perPage;

    const croppedText = pagination.data.slice(offset, offset + pagination.perPage);

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      croppedText || 'Ошибка чтения логов',
      paginationMenu(pagination),
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      'Произошла ошибка при попытке загрузить файл. Пожалуйста, попробуйте позже!',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
        },
      },
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;

    ctx.answerCbQuery('Error');
  }
});

bot.action('PREVIOUS_PAGE', async (ctx) => {
  try {
    pagination.page = pagination.page === 1 ? pagination.page : pagination.page - 1;

    const offset = (pagination.page - 1) * pagination.perPage;

    const croppedText = pagination.data.slice(offset, offset + pagination.perPage);

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      croppedText || 'Ошибка чтения логов',
      paginationMenu(pagination),
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      'Произошла ошибка при попытке загрузить файл. Пожалуйста, попробуйте позже!',
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
        },
      },
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;

    ctx.answerCbQuery('Error');
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
    ctx.reply('Выберите пункт меню:', menu);
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
    ctx.reply('Выберите пункт меню:', menu);
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
    ctx.reply('Выберите пункт меню:', menu);
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
    ctx.reply('Выберите пункт меню:', menu);
  }
});

bot.action('STATUS', async (ctx) => {
  try {
    const sheduleJobStatus = await getSheduleJobStatus();
    const reportsJobStatus = await getReportJobStatus();

    const res = await ctx.telegram.editMessageText(
      process.env.TG_ADMIN_ID,
      info.messageId,
      undefined,
      `Состояние служб:\n` +
        ` ----------------------------------------------------------------------- \n` +
        `|\tShedule\t| ------------------------------------------- | ${sheduleJobStatus ? '🟢' : '🔴'} |\n` +
        `| ------------------------------------------------------------------  |\n` +
        `|\tReports\t| ------------------------------------------- | ${reportsJobStatus ? '🟢' : '🔴'} |\n`,
      {
        reply_markup: {
          inline_keyboard: [[{ text: 'Вернуться в меню', callback_data: 'TO_MAIN' }]],
        },
      },
    );

    info.messageId = typeof res === 'boolean' ? undefined : res.message_id;

    ctx.answerCbQuery('Shedule started');
  } catch (e) {
    await logger.error(new Error(e).message, 'Bot');

    ctx.answerCbQuery('Error');
    ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже!');
    ctx.reply('Выберите пункт меню:', menu);
  }
});

start();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
