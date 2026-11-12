const { BaleClient } = require("@persian-caesar/bale.js");

require("dotenv").config();

const client = new BaleClient({
  token: process.env.BALE_TOKEN,
  mode: 'webhook',
  webhook: {
    url: 'https://yourdomain.com/bale/webhook',
    port: 3000,
    path: '/bale/webhook'
  }
});

client.on('messageCreate', async (message) => {
  await message.reply('دریافت شد!');
});

client.login();