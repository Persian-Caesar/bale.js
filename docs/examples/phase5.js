const { BaleClient } = require("../../dist");

require("dotenv").config();

const client = new BaleClient({
  token: process.env.BALE_TOKEN,
  mode: 'polling',
  polling: { timeout: 30, limit: 100 }
});

client.on('ready', (me) => {
  console.log(`Logged in as @${me.username}`);
});

client.on('messageCreate', async (message) => {
  const chatId = message.chat.id;

  switch (message.text) {
    case '/start': {
      await message.reply('به ربات خوش آمدید!');

      break;
    }

    case '/sendphoto': {
      await client.media.sendPhoto(chatId, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9idAf2Pc29bGTCNVkiMRLtWiJy2nDZiLo8FMG3wyf7ItMeC5ymNZsnmvQ&s=10', {
        caption: 'یک گربهٔ بامزه',
      });

      break;
    }

    case '/sendphotofromdisk': {
      const { readFile } = require('node:fs/promises');

      const buffer = await readFile(__dirname + '/report.pdf');
      await client.media.sendDocument(chatId, buffer, {
        caption: 'گزارش سالانه',
      });

      break;
    }

    case '/sendvideowithid': {
      await client.media.sendVideo(chatId, 'AgACAgIAAxkBAAI...', {
        caption: 'ویدیوی آموزشی',
        duration: 120,
      });

      break;
    }
  }

  // download files
  if (message.raw.document) {
    const { writeFile } = require('node:fs/promises');
    const buffer = await client.media.downloadFile(message.raw.document.file_id);

    const fileName = message.raw.document.file_id.split(":").findLast(a => a) + "." + message.raw.document.file_name.split(".").findLast(a => a);

    await writeFile(__dirname + '/downloads/' + fileName, buffer);
  }
});

client.on('callbackQuery', (query) => {
  console.log('Callback:', query.data);
});

client.on('error', (err) => {
  console.error('Bale error:', err);
});

client.login();