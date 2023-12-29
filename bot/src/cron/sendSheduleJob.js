import { CronJob } from "cron";
import { logger } from "../utils/logger.js";
import { checkPathExist, mkdir, writeFile } from "../utils/fs-helper.js";
import { Telegram, Input } from "telegraf";
import axios from "axios";

const telegram = new Telegram(process.env.BOT_TOKEN);

const sendSheduleJob = new CronJob(
  "*/5 * * * *",
  async () => {
    let counter = 0;
    const errors = [];

    try {
      const res = await axios.get("https://api.vk.com/method/wall.get", {
        params: {
          access_token: process.env.VK_API_TOKEN,
          v: process.env.VK_API_VERSION,
          domain: process.env.VK_GROUP_DOMEN,
        },
      });

      for (const post of res.data.response.items) {
        let text = post?.text?.toLowerCase();

        const isShedule = text?.includes("расписание");
        const isOFO = text?.includes("офо");
        const isBak = text?.includes("бакалавриат");

        if (isShedule && isOFO && isBak) {
          const shedule = post.attachments.find((el) => el.type === "doc");

          const file = await axios({
            url: shedule.doc.url,
            method: "GET",
            responseType: "arraybuffer",
          });

          const exist = await checkPathExist(`storage/${post.date}`);

          if (!exist) {
            counter++;

            await mkdir(`storage/${post.date}`);

            const filename = shedule.doc.title;

            await writeFile(`storage/${post.date}/${filename}`, file.data);

            await telegram
              .sendDocument(
                process.env.TG_GROUP_ID,
                Input.fromBuffer(file.data, filename)
              )
              .catch(async (e) => {
                await logger.error(new Error(e), "Telegram send document");
              });
          }
        }
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : e);
    }

    if (errors.length > 0) {
      for (const error of errors) {
        await logger.error(new Error(error));
      }
    } else {
      await logger.log(`Job completed! Sended ${counter} files`, "Cron");
    }
  },
  undefined,
  true
);

export { sendSheduleJob };
