const { BaleClient } = require("@persian-caesar/bale.js");

require("dotenv").config();

const client = new BaleClient({
  token: process.env.BALE_TOKEN,
  mode: 'webhook',
  webhook: {
    url: 'https://persiancaesar.ir',
    port: 3000,
    path: '/bale/webhook'
  }
});

client.on('ready', (me) => {
  console.log(`Logged in as @${me.username}`);
});

client.on('messageCreate', async (message) => {
  await message.reply('دریافت شد!');
});

client.login();