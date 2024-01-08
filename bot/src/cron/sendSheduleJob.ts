import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { checkPathExist, mkdir, writeFile } from '../utils/fs-helper';
import { Telegram, Input } from 'telegraf';
import axios from 'axios';
import 'dotenv/config';

const sendSheduleJob = new CronJob('*/5 * * * *', (f: any) => f, undefined, true);

const sendShedule = async (
  info: {
    counter: number;
    errors: Error[] | string[];
  },
  telegram: Telegram,
) => {
  try {
    const res = await axios.get('https://api.vk.com/method/wall.get', {
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
        const shedule = post.attachments.find((el: any) => el.type === 'doc');

        const file = await axios({
          url: shedule.doc.url,
          method: 'GET',
          responseType: 'arraybuffer',
        });

        const exist = await checkPathExist(`storage/${post.date}`);

        if (!exist) {
          info.counter++;

          await mkdir(`storage/${post.date}`);

          const filename = shedule.doc.title;

          await writeFile(`storage/${post.date}/${filename}`, file.data);

          await telegram
            .sendDocument(
              process.env.TG_GROUP_ID || 'Random',
              Input.fromBuffer(file.data, filename),
            )
            .catch(async (e: any) => {
              await logger.error(e instanceof Error ? e.message : e, 'Telegram send document');
            });
        }
      }
    }
  } catch (e: any) {
    info.errors.push(e instanceof Error ? e.message : e);
  }

  if (info.errors.length > 0) {
    for (const error of info.errors) {
      await logger.error(error instanceof Error ? error.message : error);
    }
  } else {
    await logger.log(`Job completed! Sended ${info.counter} files`, 'Cron');
  }
};

const startSheduleJob = async (
  info: {
    counter: number;
    errors: Error[] | string[];
  },
  telegram: Telegram,
) => {
  sendSheduleJob.addCallback(async () => sendShedule(info, telegram));

  sendSheduleJob.start();
};

const stopSheduleJob = async () => {
  sendSheduleJob.stop();
};

const getSheduleJobStatus = async () => sendSheduleJob.running;

export { startSheduleJob, stopSheduleJob, getSheduleJobStatus };
