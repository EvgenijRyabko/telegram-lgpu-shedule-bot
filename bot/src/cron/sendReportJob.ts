import { CronJob } from 'cron';
import { Telegram } from 'telegraf';
import { checkPathExist, clearFile } from '../utils/fs-helper';
import 'dotenv/config';
import { menu } from '../menus';

const sendReportJob = new CronJob(
  '0 8,15,22 * * *', // Cron time
  (f: any) => f, // onTick
  undefined, // onComplete
  true, // Start
  undefined, // Timezone
  undefined, // Context
  false, // runOnInit
  180, // UTC offset
);

const sendReport = async (
  info: {
    counter: number;
    errors: Error[] | string[];
    messageId: number | undefined;
  },
  status: boolean,
  telegram: Telegram,
) => {
  const res = await telegram.editMessageText(
    process.env.TG_ADMIN_ID || 'Random string',
    info.messageId,
    undefined,
    `[${new Date().toISOString()}] Отчет по работе бота:\n` +
      `Файлов отправлено: ${info.counter}\n` +
      `Ошибок: ${info.errors.length}\n` +
      `В данный момент бот ${status ? 'работает' : 'отключен'}`,
    menu,
  );

  info.messageId = typeof res === 'boolean' ? undefined : res.message_id;

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
    messageId: number | undefined;
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
