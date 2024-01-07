import { CronJob } from 'cron';
import { Telegram, Input } from 'telegraf';
import { checkPathExist, clearFile } from '../utils/fs-helper.js';
import 'dotenv/config';

const telegram = new Telegram(process.env.BOT_TOKEN);

let sendReportJob = new CronJob('* 8,22 * * *', (f) => f, undefined, true);

const sendReport = async (info, status) => {
  await telegram.sendMessage(
    process.env.TG_COMMAND_GROUP_ID,
    `Отчет по работе бота:\n` +
      `Файлов отправлено: ${info.counter}\n` +
      `Ошибок: ${info.errors.length}\n` +
      `В данный момент бот ${status ? 'работает' : 'отключен'}`,
  );

  if (info.errors.length) {
    await telegram.sendDocument(process.env.TG_COMMAND_GROUP_ID, Input.fromLocalFile('error.log'));
  }

  const errorLogExist = await checkPathExist('error.log');
  const combinedLogExist = await checkPathExist('combined.log');

  if (errorLogExist) {
    await clearFile('error.log');
  }

  if (combinedLogExist) {
    await clearFile('combined.log');
  }

  info.counter = 0;
  info.errors = [];
};

const startReportJob = async (info, status) => {
  sendReportJob.addCallback(async () => sendReport(info, status));

  sendReportJob.start();
};

const stopReportJob = async () => {
  sendReportJob.stop();
};

const getReportJobStatus = async () => sendReportJob.running;

export { startReportJob, stopReportJob, getReportJobStatus };
