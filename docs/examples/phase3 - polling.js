const { BaleClient } = require("@persian-caesar/bale.js");

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
  if (message.text === '/start') {
    await message.reply('به ربات خوش آمدید!');
  }
});

client.on('callbackQuery', (query) => {
  console.log('Callback:', query.data);
});

client.on('error', (err) => {
  console.error('Bale error:', err);
});

client.login();