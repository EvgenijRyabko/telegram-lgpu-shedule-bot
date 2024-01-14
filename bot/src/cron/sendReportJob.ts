import { CronJob } from 'cron';
import { Telegram, Input } from 'telegraf';
import { checkPathExist, clearFile } from '../utils/fs-helper';
import 'dotenv/config';

const sendReportJob = new CronJob('0 8,22 * * *', (f: any) => f, undefined, true);

const sendReport = async (
  info: {
    counter: number;
    errors: Error[] | string[];
  },
  status: boolean,
  telegram: Telegram,
) => {
  await telegram.sendMessage(
    process.env.TG_ADMIN_ID || 'Random string',
    `Отчет по работе бота:\n` +
      `Файлов отправлено: ${info.counter}\n` +
      `Ошибок: ${info.errors.length}\n` +
      `В данный момент бот ${status ? 'работает' : 'отключен'}`,
  );

  if (info.errors.length) {
    await telegram.sendDocument(
      process.env.TG_ADMIN_ID || 'Random string',
      Input.fromLocalFile('error.log'),
    );
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

const startReportJob = async (
  info: {
    counter: number;
    errors: Error[] | string[];
  },
  status: boolean,
  telegram: Telegram,
) => {
  sendReportJob.addCallback(async () => sendReport(info, status, telegram));

  sendReportJob.start();
};

const stopReportJob = async () => {
  sendReportJob.stop();
};

const getReportJobStatus = async () => sendReportJob.running;

export { startReportJob, stopReportJob, getReportJobStatus };
