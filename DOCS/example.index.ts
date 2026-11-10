import { BaleClient, InlineKeyboardBuilder } from 'bale.js';

const client = new BaleClient({ token: 'YOUR_TOKEN', mode: 'polling' });

client.on('ready', (me) => {
    console.log(`Logged in as ${me.username}`);
});

client.on('messageCreate', async (message) => {
    if (message.text === '/start') {
        const keyboard = new InlineKeyboardBuilder()
            .addButton({ text: 'کلیک', callback_data: 'btn1', color: 'primary' })
            .build();

        await message.reply('به ربات خوش آمدید!', keyboard);
    }
});

client.on('callbackQuery', async (query) => {
    console.log('Callback:', query.data);
});

client.login();