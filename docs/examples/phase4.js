const { BaleClient, InlineKeyboardBuilder, ReplyKeyboardBuilder, MessageBuilder } = require("@persian-caesar/bale.js");

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
  switch (message.text) {
    case '/start': {
      await message.reply('به ربات خوش آمدید!');

      break;
    }

    case '/inlinekeyboard': {
      const keyboard = new InlineKeyboardBuilder()
        .addButton('محصولات ما', { callback_data: 'products' })
        .addButton('سبد خرید', { callback_data: 'cart' })
        .addButton('ورود به سایت', { url: 'https://example.com', color: 'primary' })
        .adjust(2, 1) // دو دکمه در ردیف اول، یکی در ردیف دوم
        .build();

      await message.reply('یکی از گزینه‌ها را انتخاب کنید:', { reply_markup: keyboard });

      break;
    }

    case '/replykeyboard': {
      const menu = new ReplyKeyboardBuilder()
        .addButton('ارسال شماره', { request_contact: true })
        .addButton('شرایط و قوانین')
        .addButton('راهنما')
        .adjust(1, 2)
        .setOptions({ resize_keyboard: true, one_time_keyboard: true })
        .build();

      await client.messages.send(message.chat.id, 'برای دسترسی، شماره خود را ارسال کنید:', {
        reply_markup: menu,
      });

      break;
    }

    case '/messagebuilderkeyboard': {
      const keyboard = new InlineKeyboardBuilder()
        .addButton('تأیید', { callback_data: 'confirm', color: 'success' })
        .addButton('لغو', { callback_data: 'cancel', color: 'danger' })
        .build();

      const messageBuilder = new MessageBuilder()
        .setText('آیا از انجام این عملیات مطمئن هستید؟')
        .setKeyboard(keyboard)
        .build();

      await client.messages.send(message.chat.id, messageBuilder);

      break;
    }
  }


});

client.on('callbackQuery', (query) => {
  console.log('Callback:', query.data);
});

client.on('error', (err) => {
  console.error('Bale error:', err);
});

client.login();