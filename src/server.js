'use strict';

// Define the constants
const TOKEN = process.env.TELEGRAM_TOKEN;
const domain = process.env.DOMAIN;
const path = process.env.WEBHOOK_PATH;
const port = process.env.PORT;
const secret = process.env.SECRET_KEY;
const charLimit = process.env.CHAR_LIMIT;

// Initialize the required stuff
const { Telegraf } = require('telegraf');
const { say } = require('dectalk');

// Configure the bot
const bot = new Telegraf(TOKEN);

bot.start(async (ctx) => {
    await ctx.reply("Welcome to Shtytlkr! You can tell me what to say and I will say it! Use /say to tell me what to say, or, use /help for more information about me.");
});

bot.help(async (ctx) => {
    await ctx.reply("I'm a simple bot written by @umdoobby that will say things that you tell me!\r\n\r\n" +
        "I'm opensource so if you'd like to see how I work you can check me out on GitHub. " +
        "https://github.com/umdoobby/shtytlkr\r\n\r\n" +
        "/say <message> = Use this command to tell me what to say (or sing). It may take me a few moments to generate the recording " +
        "so please be patent with me. Also, I have a hard limit of " + charLimit + " characters.");
});

bot.command('quit', async (ctx) => {
    await ctx.reply("Come back any time, I'll be here if you need me.");
    await ctx.telegram.leaveChat(ctx.message.chat.id);
    await ctx.leaveChat();
});

bot.command('say', async (ctx) => {
    try {
        let message = ctx.message.text;
        message = message.slice(3).trim();
        if (message.length > 0) {
            if (message.length > charLimit) {
                await ctx.reply(`I'm sorry but I'm limited to ${charLimit} characters. Your message was ${message.length} characters long. Please shorten it and try again.`);
            } else {
                await ctx.replyWithVoice({
                    source: say(message)
                });
            }
        } else {
            await ctx.reply("There was nothing to say! Did you forget to type a message?");
        }
    } catch (e) {
        console.error("Failed while trying to say a message", e);
        await ctx.reply("I encountered an error while trying to say your message. Please try again later.");
    }
});

// Start webhook via launch method (preferred)
bot.launch({
    webhook: {
        domain: domain,
        port: port,
        hookPath: path,
        secretToken: secret,
    },
}).then(() => {
    console.log(`Shtytlkr is now listening at https://${domain}${path}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));