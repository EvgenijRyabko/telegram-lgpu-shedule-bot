import { Telegraf, Telegram } from "telegraf";
import { message } from "telegraf/filters";
import { logger } from "./utils/logger.js";
import { sendSheduleJob } from "./cron/sendSheduleJob.js";
import 'dotenv/config.js'

const bot = new Telegraf(process.env.BOT_TOKEN);
const telegram = new Telegram(process.env.BOT_TOKEN);

bot.launch().catch((e) => {
  logger.error(e, "Bot");
});

bot.command("start", async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await sendSheduleJob.start();
    await logger.log("Job started", "Cron");
  }
});

bot.command("stop", async (ctx) => {
  if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
    await sendSheduleJob.stop();
    await logger.log("Job stopped", "Cron");
  }
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
