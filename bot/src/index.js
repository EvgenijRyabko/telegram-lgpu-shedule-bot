import { Input, Telegraf } from "telegraf";
import { logger } from "./utils/logger.js";
import { sendSheduleJob } from "./cron/sendSheduleJob.js";
import 'dotenv/config.js'

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.launch().catch((e) => {
  logger.error(e, "Bot");
});

bot.command("getLog", async (ctx) => {
	if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
	  await ctx.sendDocument(Input.fromLocalFile('combined.log'));
	  await logger.log("Sended log", "Bot");
	}
 });

 bot.command("getErrors", async (ctx) => {
	if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
	  await ctx.sendDocument(Input.fromLocalFile('error.log'));
	  await logger.log("Sended error log", "Bot");
	}
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

bot.command("status", async (ctx) => {
	if (ctx.update.message.chat.id === Number(process.env.TG_COMMAND_GROUP_ID)) {
		await ctx.sendMessage(`${sendSheduleJob.running?'Cron is now running':'Cron is stopped'}`);
		await logger.log(`Checked status`, "Cron");
	}
 });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
